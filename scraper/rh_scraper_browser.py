#!/usr/bin/env python3
"""
RiskHedge Portfolio Scraper (Browser-based)
============================================
Uses Playwright to scrape portfolio data from RiskHedge member area.
Designed for one-time historical data pull.

Runs with a VISIBLE browser so you can:
  - Solve CAPTCHAs / Cloudflare challenges manually
  - Login manually if auto-login fails
  - See exactly what's happening

Usage:
    pip install playwright beautifulsoup4 lxml
    playwright install chromium

    # Auto-login (credentials via args or env vars):
    python3 rh_scraper_browser.py -e your@email.com -w yourpassword

    # Manual login (browser opens, you login yourself):
    python3 rh_scraper_browser.py --manual-login

    # Scrape only specific publications:
    python3 rh_scraper_browser.py -p disruption-x

    # Resume with saved cookies (skip login):
    python3 rh_scraper_browser.py --resume

Output:
    scraper/output/{pub_id}_portfolio.json   (matches src/data/portfolio.json format)
    scraper/output/{pub_id}_issues.json      (all scraped issues)
    scraper/output/{pub_id}_picks.json       (extracted stock picks)
    scraper/output/debug/                    (HTML + screenshots for debugging)
"""

import json
import os
import re
import sys
import time
from datetime import datetime
from urllib.parse import urljoin, urlparse

try:
    from playwright.sync_api import sync_playwright, Page, BrowserContext
except ImportError:
    print("ERROR: playwright not installed.")
    print("Run:  pip install playwright && playwright install chromium")
    sys.exit(1)

from bs4 import BeautifulSoup

# ============================================================
# Configuration
# ============================================================

BASE_URL = "https://www.riskhedge.com"
LOGIN_URL = f"{BASE_URL}/members/login"

PUBLICATIONS = [
    {
        "id": "disruption-investor",
        "name": "Disruption Investor",
        "archive_url": f"{BASE_URL}/disruption-investor",
    },
    {
        "id": "disruption-x",
        "name": "Disruption X",
        "archive_url": f"{BASE_URL}/disruption-x",
    },
    {
        "id": "express-trader",
        "name": "Express Trader",
        "archive_url": f"{BASE_URL}/express-trader",
    },
]

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")
DEBUG_DIR = os.path.join(OUTPUT_DIR, "debug")
COOKIE_FILE = os.path.join(OUTPUT_DIR, ".cookies.json")

PAGE_LOAD_TIMEOUT = 30_000  # ms
NAV_DELAY = 2.0  # seconds between navigations
CLOUDFLARE_WAIT = 30  # seconds max to wait for CF challenge


# ============================================================
# Table Parser
# ============================================================

# Maps common table header text to our field names
COLUMN_ALIASES = {
    "ticker": ["ticker", "symbol", "stock", "sym"],
    "company": ["company", "name", "company name", "stock name"],
    "action": ["action", "status", "recommendation", "rec", "rating", "signal"],
    "buyPrice": ["buy price", "entry price", "entry", "rec price", "rec. price",
                  "recommended price", "buy", "price", "avg entry", "avg price",
                  "avg. entry"],
    "buyDate": ["buy date", "date added", "date", "recommended", "rec date",
                "date recommended", "added", "entry date", "open date"],
    "latestPrice": ["current price", "latest price", "last price", "current",
                     "latest", "last", "close", "closing price", "price now"],
    "stopLoss": ["stop loss", "stop", "hard stop", "trailing stop", "stop price",
                  "stop %"],
    "positionSize": ["position size", "size", "allocation", "position", "weight",
                      "pos size"],
    "return": ["return", "gain", "loss", "gain/loss", "change", "p&l", "pnl",
               "return %", "gain %", "% change", "% return", "performance"],
    "sellDate": ["sell date", "close date", "closed", "exit date", "sold"],
    "sellPrice": ["sell price", "exit price", "close price", "sold at"],
    "freeRide": ["free ride", "free-ride", "f/r", "fr", "free ride date"],
    "guidance": ["guidance", "notes", "comment", "comments", "instructions",
                  "subscriber guidance"],
    "target": ["target", "target price", "upside", "price target"],
}


def match_column(header_text: str) -> str | None:
    """Match a table header to a known field name."""
    h = header_text.lower().strip()
    for field, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias == h or alias in h:
                return field
    return None


def parse_portfolio_table(table_rows: list[list[str]]) -> list[dict]:
    """
    Parse a portfolio table (list of rows, each a list of cell strings).
    Returns list of position dicts.
    """
    if not table_rows or len(table_rows) < 2:
        return []

    # Map columns
    header = table_rows[0]
    col_map = {}
    for i, h in enumerate(header):
        field = match_column(h)
        if field and field not in col_map:
            col_map[field] = i

    # If no ticker column found, try to detect by content (uppercase 1-5 chars)
    if "ticker" not in col_map:
        for i in range(len(header)):
            ticker_count = sum(
                1 for row in table_rows[1:]
                if len(row) > i and re.match(r'^[A-Z]{1,5}$', row[i].strip())
            )
            if ticker_count >= 2:
                col_map["ticker"] = i
                break

    if "ticker" not in col_map:
        return []

    positions = []
    for row in table_rows[1:]:
        ticker_idx = col_map["ticker"]
        if len(row) <= ticker_idx:
            continue

        ticker = row[ticker_idx].strip().upper()
        # Skip non-ticker rows (headers, totals, empty)
        if not re.match(r'^[A-Z]{1,5}$', ticker):
            continue

        pos = {"ticker": ticker}
        for field, idx in col_map.items():
            if field == "ticker" or idx >= len(row):
                continue
            val = row[idx].strip()
            if val:
                pos[field] = val

        positions.append(pos)

    return positions


def parse_price(text: str) -> float | None:
    """Parse '$12.34', '12.34', '12,345.67', etc."""
    if not text:
        return None
    cleaned = text.replace(",", "").replace("$", "").strip()
    match = re.search(r'([\d]+\.?\d*)', cleaned)
    if match:
        try:
            return round(float(match.group(1)), 2)
        except ValueError:
            pass
    return None


def parse_percentage(text: str) -> float | None:
    """Parse '47.58%', '-5.2%', etc."""
    if not text:
        return None
    match = re.search(r'(-?[\d]+\.?\d*)\s*%?', text.replace(",", ""))
    if match:
        try:
            return round(float(match.group(1)), 2)
        except ValueError:
            pass
    return None


def parse_date(text: str) -> str | None:
    """Parse various date formats into YYYY-MM-DD."""
    if not text:
        return None

    text = text.strip()

    # ISO: 2025-02-10
    m = re.match(r'^(\d{4})-(\d{1,2})-(\d{1,2})$', text)
    if m:
        return f"{m.group(1)}-{m.group(2).zfill(2)}-{m.group(3).zfill(2)}"

    # US: 02/10/2025 or 2/10/2025
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{4})$', text)
    if m:
        return f"{m.group(3)}-{m.group(1).zfill(2)}-{m.group(2).zfill(2)}"

    # US short: 02/10/25
    m = re.match(r'^(\d{1,2})/(\d{1,2})/(\d{2})$', text)
    if m:
        year = int(m.group(3))
        year = 2000 + year if year < 50 else 1900 + year
        return f"{year}-{m.group(1).zfill(2)}-{m.group(2).zfill(2)}"

    # "February 10, 2025" or "Feb 10, 2025"
    months = {
        "january": "01", "february": "02", "march": "03", "april": "04",
        "may": "05", "june": "06", "july": "07", "august": "08",
        "september": "09", "october": "10", "november": "11", "december": "12",
        "jan": "01", "feb": "02", "mar": "03", "apr": "04",
        "jun": "06", "jul": "07", "aug": "08", "sep": "09",
        "oct": "10", "nov": "11", "dec": "12",
    }
    for name, num in months.items():
        m = re.search(
            rf'\b{name}\w*\.?\s+(\d{{1,2}}),?\s+(\d{{4}})\b',
            text.lower()
        )
        if m:
            return f"{m.group(2)}-{num}-{m.group(1).zfill(2)}"
        # Also try "10 February 2025"
        m = re.search(
            rf'(\d{{1,2}})\s+{name}\w*\.?\s+(\d{{4}})\b',
            text.lower()
        )
        if m:
            return f"{m.group(2)}-{num}-{m.group(1).zfill(2)}"

    return None


def normalize_position(raw: dict, pub_id: str, position_id: int) -> dict:
    """Convert a raw scraped position dict into the portfolio.json format."""
    action_text = raw.get("action", "").strip()
    status = "open"
    action = action_text or "Buy"

    # Detect status from action text
    action_lower = action_text.lower()
    if any(x in action_lower for x in ["free ride", "free-ride", "f/r"]):
        status = "free-ride"
        action = "Free Ride"
    elif any(x in action_lower for x in ["sell", "sold", "closed", "close", "exit"]):
        status = "closed"
        action = "Sell"
    elif "hold" in action_lower:
        action = "Hold"
    elif "buy" in action_lower:
        action = "Buy"

    # Parse stop loss - could be a price or a percentage
    stop_raw = raw.get("stopLoss", "")
    stop_loss = None
    if stop_raw:
        if "%" in stop_raw:
            stop_loss = parse_percentage(stop_raw)
        else:
            stop_loss = parse_price(stop_raw)

    # Parse free ride info
    free_ride_date = None
    free_ride_raw = raw.get("freeRide", "")
    if free_ride_raw:
        free_ride_date = parse_date(free_ride_raw)
        if not free_ride_date and status != "free-ride":
            # If there's free ride data, mark as free ride
            if any(c.isdigit() for c in free_ride_raw):
                status = "free-ride"
                action = "Free Ride"

    # Parse position size
    size_raw = raw.get("positionSize", "Full")
    if not size_raw or size_raw.lower() in ("full", "100%", "1"):
        size = "Full"
    elif "half" in size_raw.lower() or "1/2" in size_raw or "50%" in size_raw:
        size = "1/2"
    elif "third" in size_raw.lower() or "1/3" in size_raw or "33%" in size_raw:
        size = "1/3"
    elif "quarter" in size_raw.lower() or "1/4" in size_raw or "25%" in size_raw:
        size = "1/4"
    else:
        size = size_raw

    return {
        "id": position_id,
        "newsletter": pub_id,
        "ticker": raw["ticker"],
        "company": raw.get("company", ""),
        "action": action,
        "buyDate": parse_date(raw.get("buyDate", "")),
        "buyPrice": parse_price(raw.get("buyPrice", "")),
        "sellDate": parse_date(raw.get("sellDate", "")),
        "sellPrice": parse_price(raw.get("sellPrice", "")),
        "latestPrice": parse_price(raw.get("latestPrice", "")),
        "freeRideDate": free_ride_date,
        "freeRidePct": None,
        "freeRidePrice": None,
        "stopLoss": stop_loss,
        "positionSize": size,
        "status": status,
        "guidance": raw.get("guidance", ""),
        "notes": raw.get("notes", ""),
    }


# ============================================================
# Scraper
# ============================================================

class RiskHedgeBrowserScraper:
    def __init__(self, email: str = "", password: str = "",
                 headless: bool = False, manual_login: bool = False):
        self.email = email
        self.password = password
        self.headless = headless
        self.manual_login = manual_login
        self.pw = None
        self.browser = None
        self.context: BrowserContext = None
        self.page: Page = None
        self.api_responses: list[dict] = []  # intercepted API data

    # --------------------------------------------------------
    # Browser lifecycle
    # --------------------------------------------------------

    def start(self):
        """Launch browser with persistent cookie storage."""
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        os.makedirs(DEBUG_DIR, exist_ok=True)

        self.pw = sync_playwright().start()
        self.browser = self.pw.chromium.launch(
            headless=self.headless,
            args=["--disable-blink-features=AutomationControlled"],
        )

        # Load saved cookies if they exist
        storage_state = COOKIE_FILE if os.path.exists(COOKIE_FILE) else None
        self.context = self.browser.new_context(
            storage_state=storage_state,
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
        )

        # Intercept API responses that might contain portfolio data
        self.context.on("response", self._on_response)

        self.page = self.context.new_page()
        self.page.set_default_timeout(PAGE_LOAD_TIMEOUT)

        if storage_state:
            print(f"  Loaded saved cookies from {COOKIE_FILE}")

    def stop(self):
        """Save cookies and close browser."""
        if self.context:
            try:
                self.context.storage_state(path=COOKIE_FILE)
                print(f"  Saved cookies to {COOKIE_FILE}")
            except Exception:
                pass
        if self.browser:
            self.browser.close()
        if self.pw:
            self.pw.stop()

    def _on_response(self, response):
        """Intercept API responses that might contain portfolio/issue data."""
        url = response.url
        content_type = response.headers.get("content-type", "")

        if "application/json" in content_type and response.status == 200:
            # Look for API calls that might return portfolio or issue data
            interesting_patterns = [
                "portfolio", "position", "pick", "issue", "article",
                "newsletter", "stock", "holding", "trade",
            ]
            url_lower = url.lower()
            if any(pat in url_lower for pat in interesting_patterns):
                try:
                    data = response.json()
                    self.api_responses.append({
                        "url": url,
                        "data": data,
                        "timestamp": datetime.now().isoformat(),
                    })
                    print(f"  [API] Captured: {url}")
                except Exception:
                    pass

    # --------------------------------------------------------
    # Navigation helpers
    # --------------------------------------------------------

    def _navigate(self, url: str, description: str = "") -> bool:
        """Navigate to URL, handle Cloudflare, return True if successful."""
        desc = f" ({description})" if description else ""
        print(f"  Navigating to: {url}{desc}")

        try:
            self.page.goto(url, wait_until="domcontentloaded", timeout=PAGE_LOAD_TIMEOUT)
        except Exception as e:
            print(f"  Navigation error: {e}")
            return False

        # Wait for Cloudflare challenge if present
        if not self._wait_for_cloudflare():
            return False

        # Additional wait for JS rendering
        try:
            self.page.wait_for_load_state("networkidle", timeout=10_000)
        except Exception:
            pass  # networkidle can be flaky, continue anyway

        time.sleep(NAV_DELAY)
        return True

    def _wait_for_cloudflare(self) -> bool:
        """Detect and wait for Cloudflare challenge page to resolve."""
        start = time.time()
        while time.time() - start < CLOUDFLARE_WAIT:
            title = self.page.title().lower()
            body_text = ""
            try:
                body_text = self.page.text_content("body", timeout=3000) or ""
                body_text = body_text.lower()[:500]
            except Exception:
                pass

            cf_indicators = [
                "just a moment",
                "checking your browser",
                "attention required",
                "cloudflare",
                "enable javascript",
                "verifying you are human",
                "ray id",
            ]

            is_cf = any(ind in title or ind in body_text for ind in cf_indicators)

            if not is_cf:
                return True

            elapsed = int(time.time() - start)
            print(f"  Waiting for Cloudflare challenge... ({elapsed}s)")
            time.sleep(2)

        print("  WARNING: Cloudflare challenge did not resolve after "
              f"{CLOUDFLARE_WAIT}s. Solve it manually in the browser.")
        input("  Press Enter once the page has loaded...")
        return True

    def _save_debug(self, name: str):
        """Save page HTML and screenshot for debugging."""
        try:
            html_path = os.path.join(DEBUG_DIR, f"{name}.html")
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(self.page.content())

            png_path = os.path.join(DEBUG_DIR, f"{name}.png")
            self.page.screenshot(path=png_path, full_page=True)
            print(f"  [debug] Saved: {name}.html + {name}.png")
        except Exception as e:
            print(f"  [debug] Save failed: {e}")

    def _get_soup(self) -> BeautifulSoup:
        """Get BeautifulSoup of current page."""
        return BeautifulSoup(self.page.content(), "lxml")

    # --------------------------------------------------------
    # Authentication
    # --------------------------------------------------------

    def login(self) -> bool:
        """Login to RiskHedge. Returns True if logged in."""
        print("\n=== Logging in to RiskHedge ===")

        # Check if already logged in (from saved cookies)
        if self._check_logged_in():
            print("  Already logged in (from saved cookies)")
            return True

        if self.manual_login:
            return self._manual_login()

        if self.email and self.password:
            if self._auto_login():
                return True
            print("  Auto-login failed, falling back to manual login...")

        return self._manual_login()

    def _check_logged_in(self) -> bool:
        """Check if we're already authenticated."""
        if not self._navigate(BASE_URL, "checking login status"):
            return False

        self._save_debug("login_check")

        # If we can access a members page without getting redirected to login
        try:
            current_url = self.page.url
            page_text = (self.page.text_content("body", timeout=5000) or "").lower()

            # Look for signs of being logged in
            logged_in_indicators = [
                "logout", "log out", "sign out", "my account",
                "dashboard", "member", "welcome back",
            ]
            return any(ind in page_text for ind in logged_in_indicators)
        except Exception:
            return False

    def _auto_login(self) -> bool:
        """Try to login automatically using credentials."""
        print("  Attempting auto-login...")

        if not self._navigate(LOGIN_URL, "login page"):
            return False

        self._save_debug("login_page")

        # Fill email
        email_selectors = [
            'input[name="email"]', 'input[type="email"]',
            'input[name="username"]', 'input[name="login"]',
            'input[name="user_email"]', 'input[name="log"]',
        ]
        email_filled = False
        for sel in email_selectors:
            try:
                el = self.page.query_selector(sel)
                if el and el.is_visible():
                    el.fill(self.email)
                    email_filled = True
                    print(f"    Filled email via: {sel}")
                    break
            except Exception:
                continue

        # Fallback: try any visible text/email input
        if not email_filled:
            try:
                for inp in self.page.query_selector_all("input:visible"):
                    itype = (inp.get_attribute("type") or "text").lower()
                    if itype in ("text", "email"):
                        inp.fill(self.email)
                        email_filled = True
                        print("    Filled email via generic text input")
                        break
            except Exception:
                pass

        # Fill password
        pass_selectors = [
            'input[name="password"]', 'input[type="password"]',
            'input[name="pass"]', 'input[name="user_password"]',
        ]
        pass_filled = False
        for sel in pass_selectors:
            try:
                el = self.page.query_selector(sel)
                if el and el.is_visible():
                    el.fill(self.password)
                    pass_filled = True
                    print(f"    Filled password via: {sel}")
                    break
            except Exception:
                continue

        if not email_filled or not pass_filled:
            print("    Could not find login form fields")
            self._save_debug("login_fields_not_found")
            return False

        # Submit
        submit_selectors = [
            'button[type="submit"]', 'input[type="submit"]',
            'button:has-text("Log In")', 'button:has-text("Login")',
            'button:has-text("Sign In")', 'button:has-text("Submit")',
            'form button',
        ]
        submitted = False
        for sel in submit_selectors:
            try:
                el = self.page.query_selector(sel)
                if el and el.is_visible():
                    el.click()
                    submitted = True
                    print(f"    Clicked submit via: {sel}")
                    break
            except Exception:
                continue

        if not submitted:
            # Press Enter in password field
            for sel in pass_selectors:
                try:
                    el = self.page.query_selector(sel)
                    if el:
                        el.press("Enter")
                        submitted = True
                        print("    Submitted via Enter key")
                        break
                except Exception:
                    continue

        if not submitted:
            print("    Could not find submit button")
            self._save_debug("login_no_submit")
            return False

        # Wait for navigation after login
        try:
            self.page.wait_for_load_state("networkidle", timeout=15_000)
        except Exception:
            pass

        time.sleep(3)
        self._save_debug("post_login")

        # Verify login succeeded
        current_url = self.page.url
        print(f"    Post-login URL: {current_url}")

        if "/login" in current_url.lower():
            # Still on login page - check for error messages
            try:
                page_text = self.page.text_content("body", timeout=3000) or ""
                if any(x in page_text.lower() for x in [
                    "invalid", "incorrect", "wrong", "failed", "error", "try again"
                ]):
                    print("    Login failed: invalid credentials")
                    return False
            except Exception:
                pass
            print("    Still on login page after submit")
            return False

        print("    Login successful!")
        return True

    def _manual_login(self) -> bool:
        """Let user login manually in the browser."""
        print("\n  === MANUAL LOGIN ===")
        print("  A browser window is open. Please:")
        print("  1. Navigate to the RiskHedge login page")
        print("  2. Log in with your credentials")
        print("  3. Once logged in, come back here")

        # Navigate to login page
        self._navigate(LOGIN_URL, "login page for manual login")

        input("\n  Press Enter once you've logged in successfully...")

        self._save_debug("manual_login_done")

        # Verify
        try:
            page_text = (self.page.text_content("body", timeout=5000) or "").lower()
            if any(x in page_text for x in ["logout", "member", "dashboard"]):
                print("  Manual login verified!")
                return True
        except Exception:
            pass

        print("  Could not verify login, but continuing anyway...")
        return True

    # --------------------------------------------------------
    # Portfolio page scraping
    # --------------------------------------------------------

    def scrape_portfolio_page(self, pub_id: str) -> list[dict]:
        """
        Try to find and scrape the portfolio/model portfolio page.
        This is the most valuable target — one table with all positions.
        Returns list of raw position dicts.
        """
        print(f"\n--- Scraping portfolio page for {pub_id} ---")

        # Try many possible URL patterns
        portfolio_urls = [
            f"{BASE_URL}/{pub_id}/portfolio",
            f"{BASE_URL}/members/{pub_id}/portfolio",
            f"{BASE_URL}/{pub_id}/model-portfolio",
            f"{BASE_URL}/members/{pub_id}/model-portfolio",
            f"{BASE_URL}/portfolio/{pub_id}",
            f"{BASE_URL}/members/portfolio/{pub_id}",
            f"{BASE_URL}/{pub_id}#portfolio",
            f"{BASE_URL}/members/{pub_id}",
            f"{BASE_URL}/{pub_id}/positions",
            f"{BASE_URL}/members/{pub_id}/positions",
        ]

        all_positions = []

        for url in portfolio_urls:
            if not self._navigate(url, f"portfolio attempt"):
                continue

            # Check if we got redirected to login
            if "/login" in self.page.url.lower():
                print("    Redirected to login — skipping this URL")
                continue

            # Check if we got a 404 or error page
            title = self.page.title().lower()
            if "not found" in title or "404" in title or "error" in title:
                continue

            self._save_debug(f"{pub_id}_portfolio_attempt_{len(all_positions)}")

            # Look for tables
            positions = self._extract_tables_from_page(pub_id)
            if positions:
                print(f"    Found {len(positions)} positions at {url}")
                all_positions = positions
                break

        # Also check intercepted API responses
        api_positions = self._extract_from_api_responses(pub_id)
        if api_positions and len(api_positions) > len(all_positions):
            print(f"    Found {len(api_positions)} positions from API responses")
            all_positions = api_positions

        if not all_positions:
            print("    No portfolio page found automatically.")
            print("    You can navigate to the portfolio page manually in the browser.")
            try_manual = input("    Navigate manually and press Enter, or type 'skip' to skip: ")
            if try_manual.strip().lower() != "skip":
                self._save_debug(f"{pub_id}_portfolio_manual")
                all_positions = self._extract_tables_from_page(pub_id)
                if all_positions:
                    print(f"    Found {len(all_positions)} positions from manual page")

        return all_positions

    def _extract_tables_from_page(self, pub_id: str) -> list[dict]:
        """Extract position data from all tables on the current page."""
        soup = self._get_soup()
        all_positions = []

        for table in soup.find_all("table"):
            rows = []
            for tr in table.find_all("tr"):
                cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                if cells:
                    rows.append(cells)

            positions = parse_portfolio_table(rows)
            if positions:
                all_positions.extend(positions)

        # Also look for div-based "tables" (some sites use CSS grid/flex)
        if not all_positions:
            all_positions = self._extract_from_divs(soup)

        return all_positions

    def _extract_from_divs(self, soup: BeautifulSoup) -> list[dict]:
        """Try to extract position data from div-based layouts."""
        positions = []

        # Look for cards/items with ticker-like content
        card_selectors = [
            re.compile(r"card|item|row|position|holding|pick|stock", re.I),
        ]

        for pattern in card_selectors:
            cards = soup.find_all(class_=pattern)
            for card in cards:
                text = card.get_text(separator=" ", strip=True)
                # Look for a ticker symbol
                ticker_match = re.search(r'\b([A-Z]{1,5})\b', text)
                if ticker_match:
                    ticker = ticker_match.group(1)
                    # Skip common false positives
                    skip = {"THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU",
                            "ALL", "CAN", "CEO", "CFO", "IPO", "ETF", "AI",
                            "US", "USA", "SEC", "FDA", "BUY", "SELL", "NEW",
                            "NYSE", "OUR", "HAS", "HIS", "HER"}
                    if ticker in skip:
                        continue
                    positions.append({
                        "ticker": ticker,
                        "raw_text": text[:500],
                    })

        return positions

    def _extract_from_api_responses(self, pub_id: str) -> list[dict]:
        """Extract position data from intercepted API responses."""
        positions = []

        for resp in self.api_responses:
            data = resp["data"]
            # Try to find position-like data in the response
            items = []
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                # Look for array values that might contain positions
                for key in ["positions", "holdings", "picks", "stocks",
                            "data", "results", "items", "portfolio"]:
                    if key in data and isinstance(data[key], list):
                        items = data[key]
                        break

            for item in items:
                if not isinstance(item, dict):
                    continue
                # Look for ticker field
                ticker = None
                for key in ["ticker", "symbol", "stock", "sym"]:
                    if key in item:
                        ticker = str(item[key]).upper().strip()
                        break
                if ticker and re.match(r'^[A-Z]{1,5}$', ticker):
                    pos = {"ticker": ticker}
                    # Map known fields
                    field_map = {
                        "company": ["company", "name", "company_name"],
                        "buyPrice": ["buy_price", "entry_price", "price"],
                        "buyDate": ["buy_date", "date_added", "date"],
                        "action": ["action", "status", "recommendation"],
                        "stopLoss": ["stop_loss", "stop"],
                    }
                    for our_field, source_keys in field_map.items():
                        for sk in source_keys:
                            if sk in item and item[sk] is not None:
                                pos[our_field] = str(item[sk])
                                break
                    positions.append(pos)

        return positions

    # --------------------------------------------------------
    # Archive / issue scraping
    # --------------------------------------------------------

    def scrape_archive(self, pub: dict) -> tuple[list[dict], list[dict]]:
        """
        Scrape the issue archive for a publication.
        Returns (issues, picks).
        """
        pub_id = pub["id"]
        archive_url = pub["archive_url"]

        print(f"\n--- Scraping archive for {pub['name']} ---")

        # Try main archive URL
        all_issues = []
        issue_links = []

        urls_to_try = [
            archive_url,
            f"{archive_url}/archive",
            f"{archive_url}/issues",
            f"{BASE_URL}/members/{pub_id}",
            f"{BASE_URL}/members/{pub_id}/archive",
            f"{BASE_URL}/members/{pub_id}/issues",
        ]

        for url in urls_to_try:
            if not self._navigate(url, "archive"):
                continue
            if "/login" in self.page.url.lower():
                continue

            self._scroll_to_bottom()
            self._save_debug(f"{pub_id}_archive")

            soup = self._get_soup()
            links = self._find_issue_links(soup, url, pub_id)

            if links:
                print(f"    Found {len(links)} issue links at {url}")
                issue_links = links
                break

        if not issue_links:
            print("    No archive found automatically.")
            print("    You can navigate to the archive page manually.")
            try_manual = input("    Navigate manually and press Enter, or 'skip': ")
            if try_manual.strip().lower() != "skip":
                self._scroll_to_bottom()
                self._save_debug(f"{pub_id}_archive_manual")
                soup = self._get_soup()
                issue_links = self._find_issue_links(soup, self.page.url, pub_id)
                if issue_links:
                    print(f"    Found {len(issue_links)} issue links from manual page")

        # Scrape each issue
        all_picks = []
        for i, link in enumerate(issue_links):
            print(f"\n  [{i+1}/{len(issue_links)}] {link['title'][:60]}")

            try:
                if not self._navigate(link["url"], "issue"):
                    all_issues.append({**link, "error": "navigation failed"})
                    continue

                if "/login" in self.page.url.lower():
                    all_issues.append({**link, "error": "login required"})
                    continue

                soup = self._get_soup()
                content_area = (
                    soup.find("article") or
                    soup.find("div", class_=re.compile(
                        r"content|entry|post|article|issue", re.I)) or
                    soup.find("main") or
                    soup.body
                )

                text = ""
                tables = []
                if content_area:
                    text = content_area.get_text(separator="\n", strip=True)
                    for table in content_area.find_all("table"):
                        rows = []
                        for tr in table.find_all("tr"):
                            cells = [td.get_text(strip=True)
                                     for td in tr.find_all(["td", "th"])]
                            if cells:
                                rows.append(cells)
                        if rows:
                            tables.append(rows)

                issue_data = {
                    **link,
                    "full_text": text[:5000],  # truncate for storage
                    "tables": tables,
                    "html_length": len(self.page.content()),
                }
                all_issues.append(issue_data)

                # Extract picks
                picks = self._extract_picks_from_issue(issue_data)
                if picks:
                    print(f"    {len(picks)} picks found")
                    all_picks.extend(picks)

            except Exception as e:
                print(f"    ERROR: {e}")
                all_issues.append({**link, "error": str(e)})

        return all_issues, all_picks

    def _scroll_to_bottom(self, max_scrolls: int = 15):
        """Scroll to load lazy/infinite content."""
        for i in range(max_scrolls):
            prev_height = self.page.evaluate("document.body.scrollHeight")
            self.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1.5)
            new_height = self.page.evaluate("document.body.scrollHeight")
            if new_height == prev_height:
                break

        # Click "Load More" / "Show More" buttons
        load_more_selectors = [
            'button:has-text("Load More")', 'a:has-text("Load More")',
            'button:has-text("Show More")', 'a:has-text("Show More")',
            'button:has-text("View More")', 'a:has-text("View More")',
            '.load-more', '.show-more', '[data-action="load-more"]',
        ]
        for sel in load_more_selectors:
            try:
                btn = self.page.query_selector(sel)
                if btn and btn.is_visible():
                    btn.click()
                    print(f"    Clicked: {sel}")
                    try:
                        self.page.wait_for_load_state("networkidle", timeout=5000)
                    except Exception:
                        pass
                    time.sleep(2)
            except Exception:
                pass

    def _find_issue_links(self, soup: BeautifulSoup, page_url: str,
                          pub_id: str) -> list[dict]:
        """Find newsletter issue links on the current page."""
        issues = []
        seen = set()
        patterns = [pub_id, "issue", "newsletter", "update", "alert",
                    "report", "briefing"]

        for a in soup.find_all("a", href=True):
            href = a["href"]
            full_url = urljoin(page_url, href)
            text = a.get_text(strip=True)

            if not text or len(text) < 5 or full_url in seen:
                continue
            parsed = urlparse(full_url)
            if parsed.netloc and "riskhedge.com" not in parsed.netloc:
                continue

            href_lower = href.lower()
            text_lower = text.lower()

            # Skip obvious nav/utility links
            skip_patterns = [
                "login", "logout", "contact", "about", "privacy",
                "terms", "faq", "support", "#", "javascript:",
                "subscribe", "signup", "sign-up", "mailto:",
                "facebook", "twitter", "linkedin", "youtube",
            ]
            if any(skip in href_lower for skip in skip_patterns):
                continue

            # Check if link looks like an issue
            is_issue = any(
                pat in href_lower or pat in text_lower for pat in patterns
            )
            if re.search(r'/\d{4}/\d{2}', href):
                is_issue = True
            if re.search(r'issue[_-]?\d+', href_lower):
                is_issue = True
            # Links with dates in the text
            if re.search(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b', text):
                is_issue = True

            if is_issue:
                date = parse_date(text)
                issues.append({
                    "title": text,
                    "url": full_url,
                    "date": date,
                })
                seen.add(full_url)

        # Fallback: if no issue-specific links found, grab all internal links
        # that look like content (not nav)
        if not issues:
            for a in soup.find_all("a", href=True):
                href = a["href"]
                full_url = urljoin(page_url, href)
                text = a.get_text(strip=True)

                if full_url in seen or not text or len(text) < 15:
                    continue
                parsed = urlparse(full_url)
                if parsed.netloc and "riskhedge.com" not in parsed.netloc:
                    continue
                if any(skip in href.lower() for skip in [
                    "login", "logout", "contact", "about", "privacy",
                    "terms", "#", "javascript:", "subscribe",
                ]):
                    continue

                issues.append({
                    "title": text,
                    "url": full_url,
                    "date": parse_date(text),
                })
                seen.add(full_url)

        issues.sort(key=lambda x: x.get("date") or "0000", reverse=True)
        return issues

    def _extract_picks_from_issue(self, issue_data: dict) -> list[dict]:
        """Extract stock picks from an issue."""
        picks = []
        seen_tickers = set()

        # From tables
        for table in issue_data.get("tables", []):
            table_positions = parse_portfolio_table(table)
            for pos in table_positions:
                if pos["ticker"] not in seen_tickers:
                    pos["source_issue"] = issue_data.get("title", "")
                    pos["source_url"] = issue_data.get("url", "")
                    picks.append(pos)
                    seen_tickers.add(pos["ticker"])

        # From text (fallback)
        if not picks:
            text = issue_data.get("full_text", "")
            buy_patterns = [
                r'(?:buy|recommend|action[:\s]+buy)\s+([A-Z]{1,5})\b',
                r'(?:ticker|symbol)[:\s]+([A-Z]{1,5})\b',
                r'(?:new\s+pick|new\s+recommendation)[:\s]*([A-Z]{1,5})\b',
                r'(?:adding|add)\s+([A-Z]{1,5})\b',
            ]
            skip = {
                "THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL",
                "CAN", "HER", "WAS", "ONE", "OUR", "OUT", "HAS", "ITS",
                "GDP", "CEO", "CFO", "IPO", "ETF", "AI", "US", "USA",
                "SEC", "FDA", "NYSE", "NASDAQ", "BUY", "SELL", "NEW",
                "NOW", "GET", "SET", "TOP", "PER", "HOW", "WHY",
            }
            for pattern in buy_patterns:
                for m in re.finditer(pattern, text, re.IGNORECASE):
                    ticker = m.group(1).upper()
                    if ticker not in skip and ticker not in seen_tickers:
                        picks.append({
                            "ticker": ticker,
                            "date": issue_data.get("date"),
                            "source_issue": issue_data.get("title", ""),
                            "source_url": issue_data.get("url", ""),
                        })
                        seen_tickers.add(ticker)

        return picks

    # --------------------------------------------------------
    # Output
    # --------------------------------------------------------

    def _build_portfolio_json(self, pub_id: str, positions: list[dict]) -> dict:
        """Build the portfolio.json structure the app expects."""
        pub_name = next(
            (p["name"] for p in PUBLICATIONS if p["id"] == pub_id),
            pub_id
        )

        normalized = []
        for i, pos in enumerate(positions, start=1):
            normalized.append(normalize_position(pos, pub_id, i))

        return {
            "newsletters": [{
                "id": pub_id,
                "name": pub_name,
                "source": "RiskHedge",
                "url": f"{BASE_URL}/{pub_id}",
            }],
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "positions": normalized,
        }

    def _save_results(self, pub_id: str, portfolio_positions: list[dict],
                      issues: list[dict], picks: list[dict]):
        """Save all output files."""
        # Portfolio JSON (app format)
        portfolio = self._build_portfolio_json(pub_id, portfolio_positions)
        portfolio_path = os.path.join(OUTPUT_DIR, f"{pub_id}_portfolio.json")
        with open(portfolio_path, "w", encoding="utf-8") as f:
            json.dump(portfolio, f, indent=2, default=str)
        print(f"  Saved portfolio ({len(portfolio_positions)} positions): {portfolio_path}")

        # Issues
        issues_path = os.path.join(OUTPUT_DIR, f"{pub_id}_issues.json")
        with open(issues_path, "w", encoding="utf-8") as f:
            json.dump(issues, f, indent=2, default=str)
        print(f"  Saved issues ({len(issues)}): {issues_path}")

        # Picks
        picks_path = os.path.join(OUTPUT_DIR, f"{pub_id}_picks.json")
        with open(picks_path, "w", encoding="utf-8") as f:
            json.dump(picks, f, indent=2, default=str)
        print(f"  Saved picks ({len(picks)}): {picks_path}")

        # API responses (if any captured)
        if self.api_responses:
            api_path = os.path.join(OUTPUT_DIR, f"{pub_id}_api_responses.json")
            with open(api_path, "w", encoding="utf-8") as f:
                json.dump(self.api_responses, f, indent=2, default=str)
            print(f"  Saved API responses ({len(self.api_responses)}): {api_path}")

    # --------------------------------------------------------
    # Main runner
    # --------------------------------------------------------

    def run(self, publication_ids: list[str] | None = None):
        """Run the scraper."""
        self.start()

        try:
            if not self.login():
                print("\nFATAL: Could not log in.")
                print("Try:  python3 rh_scraper_browser.py --manual-login")
                sys.exit(1)

            # Save cookies immediately after login
            self.context.storage_state(path=COOKIE_FILE)

            pubs = PUBLICATIONS
            if publication_ids:
                pubs = [p for p in PUBLICATIONS if p["id"] in publication_ids]

            for pub in pubs:
                pub_id = pub["id"]
                print(f"\n{'='*60}")
                print(f"SCRAPING: {pub['name']}")
                print(f"{'='*60}")

                # Clear API response buffer for this publication
                self.api_responses = []

                # 1. Scrape portfolio page (most valuable)
                portfolio_positions = self.scrape_portfolio_page(pub_id)

                # 2. Scrape issue archive
                issues, picks = self.scrape_archive(pub)

                # 3. Merge: prefer portfolio page data, supplement with picks
                if not portfolio_positions and picks:
                    print(f"\n  No portfolio page found — using {len(picks)} "
                          "picks from issues as portfolio data")
                    portfolio_positions = picks

                # 4. Save everything
                self._save_results(pub_id, portfolio_positions, issues, picks)

            # Summary
            print(f"\n{'='*60}")
            print("SCRAPING COMPLETE")
            print(f"{'='*60}")
            print(f"Output saved to: {OUTPUT_DIR}")
            print(f"Debug files in: {DEBUG_DIR}")
            print(f"\nTo use in the app, copy the portfolio JSON:")
            print(f"  cp {OUTPUT_DIR}/<pub_id>_portfolio.json src/data/portfolio.json")

        except KeyboardInterrupt:
            print("\n\nInterrupted by user. Saving cookies...")
        finally:
            self.stop()


# ============================================================
# CLI
# ============================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Scrape RiskHedge portfolio data (browser-based)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Login with credentials:
  python3 rh_scraper_browser.py -e you@email.com -w yourpass

  # Login manually in the browser:
  python3 rh_scraper_browser.py --manual-login

  # Only scrape Disruption X:
  python3 rh_scraper_browser.py -p disruption-x --manual-login

  # Resume with saved cookies (no login needed):
  python3 rh_scraper_browser.py --resume -p disruption-x

  # Run headless (no visible browser):
  python3 rh_scraper_browser.py --headless -e you@email.com -w pass
        """
    )
    parser.add_argument(
        "-p", "--publications",
        nargs="+",
        choices=[p["id"] for p in PUBLICATIONS],
        help="Which publications to scrape (default: all)"
    )
    parser.add_argument(
        "-e", "--email",
        default=os.environ.get("RH_EMAIL", ""),
        help="Login email (or set RH_EMAIL env var)"
    )
    parser.add_argument(
        "-w", "--password",
        default=os.environ.get("RH_PASSWORD", ""),
        help="Login password (or set RH_PASSWORD env var)"
    )
    parser.add_argument(
        "--manual-login",
        action="store_true",
        help="Login manually in the browser window"
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Skip login, use saved cookies from previous run"
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run browser without visible window (not recommended)"
    )

    args = parser.parse_args()

    email = args.email
    password = args.password
    manual = args.manual_login

    # If --resume, skip login entirely (rely on saved cookies)
    if args.resume:
        if not os.path.exists(COOKIE_FILE):
            print("ERROR: No saved cookies found. Run without --resume first.")
            sys.exit(1)
        manual = False
        # We'll check login status and it should pass with cookies

    # If no credentials and not manual, prompt
    if not manual and not args.resume:
        if not email:
            email = input("RiskHedge email: ")
        if not password:
            import getpass
            password = getpass.getpass("RiskHedge password: ")

    scraper = RiskHedgeBrowserScraper(
        email=email,
        password=password,
        headless=args.headless,
        manual_login=manual,
    )
    scraper.run(args.publications)
