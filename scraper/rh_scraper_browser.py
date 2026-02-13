#!/usr/bin/env python3
"""
RiskHedge Scraper — Browser-based (Playwright) version.
========================================================
Use this if the requests-based scraper fails due to JavaScript rendering.

Usage:
    pip install playwright beautifulsoup4 lxml
    playwright install chromium
    python3 rh_scraper_browser.py

This version uses a real browser so it handles:
  - JavaScript-rendered content (React/SPA)
  - Cloudflare challenges
  - Dynamic pagination (infinite scroll, "load more" buttons)
"""

import json
import os
import re
import sys
import time
from datetime import datetime

try:
    from playwright.sync_api import sync_playwright, Page, Browser
except ImportError:
    print("ERROR: playwright not installed.")
    print("Run: pip install playwright && playwright install chromium")
    sys.exit(1)

from bs4 import BeautifulSoup

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

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
REQUEST_DELAY = 2.0


class RiskHedgeBrowserScraper:
    def __init__(self, email: str, password: str, headless: bool = False):
        self.email = email
        self.password = password
        self.headless = headless
        self.pw = None
        self.browser: Browser = None
        self.page: Page = None

    def start(self):
        self.pw = sync_playwright().start()
        self.browser = self.pw.chromium.launch(headless=self.headless)
        self.page = self.browser.new_page()
        self.page.set_default_timeout(30000)

    def stop(self):
        if self.browser:
            self.browser.close()
        if self.pw:
            self.pw.stop()

    def _delay(self):
        time.sleep(REQUEST_DELAY)

    def _save_debug(self, name: str):
        debug_dir = os.path.join(OUTPUT_DIR, "debug")
        os.makedirs(debug_dir, exist_ok=True)
        path = os.path.join(debug_dir, f"{name}.html")
        self.page.content()
        with open(path, "w") as f:
            f.write(self.page.content())
        # Also save a screenshot
        ss_path = os.path.join(debug_dir, f"{name}.png")
        self.page.screenshot(path=ss_path, full_page=True)
        print(f"  [debug] Saved: {path} + {ss_path}")

    # --------------------------------------------------------
    # Login
    # --------------------------------------------------------

    def login(self) -> bool:
        print("=== Logging in to RiskHedge ===")
        print(f"  Navigating to {LOGIN_URL}")
        self.page.goto(LOGIN_URL, wait_until="networkidle")
        self._delay()

        self._save_debug("login_page")

        # Find and fill the email field
        email_selectors = [
            'input[name="email"]', 'input[type="email"]',
            'input[name="username"]', 'input[name="login"]',
            'input[name="user_email"]',
        ]
        email_filled = False
        for sel in email_selectors:
            el = self.page.query_selector(sel)
            if el:
                el.fill(self.email)
                email_filled = True
                print(f"  Filled email via: {sel}")
                break

        if not email_filled:
            # Try any text/email input before a password field
            inputs = self.page.query_selector_all("input")
            for inp in inputs:
                itype = inp.get_attribute("type") or "text"
                if itype in ("text", "email"):
                    inp.fill(self.email)
                    email_filled = True
                    print(f"  Filled email via generic text input")
                    break

        # Find and fill the password field
        pass_selectors = [
            'input[name="password"]', 'input[type="password"]',
            'input[name="pass"]', 'input[name="user_password"]',
        ]
        pass_filled = False
        for sel in pass_selectors:
            el = self.page.query_selector(sel)
            if el:
                el.fill(self.password)
                pass_filled = True
                print(f"  Filled password via: {sel}")
                break

        if not email_filled or not pass_filled:
            print("  ERROR: Could not find login form fields!")
            self._save_debug("login_failed_fields")
            return False

        # Submit the form
        submit_selectors = [
            'button[type="submit"]', 'input[type="submit"]',
            'button:has-text("Log In")', 'button:has-text("Login")',
            'button:has-text("Sign In")', 'button:has-text("Submit")',
        ]
        submitted = False
        for sel in submit_selectors:
            el = self.page.query_selector(sel)
            if el:
                el.click()
                submitted = True
                print(f"  Clicked submit via: {sel}")
                break

        if not submitted:
            # Try pressing Enter in the password field
            for sel in pass_selectors:
                el = self.page.query_selector(sel)
                if el:
                    el.press("Enter")
                    submitted = True
                    print("  Submitted via Enter key")
                    break

        # Wait for navigation
        try:
            self.page.wait_for_load_state("networkidle", timeout=15000)
        except:
            pass

        self._delay()
        self._save_debug("post_login")

        current_url = self.page.url
        print(f"  Post-login URL: {current_url}")

        # Check for success
        if "/login" not in current_url.lower():
            print("  Login successful (redirected away from login)")
            return True

        page_text = self.page.text_content("body").lower()
        if any(x in page_text for x in ["dashboard", "portfolio", "logout", "member"]):
            print("  Login successful (found member content)")
            return True

        print("  Login may have failed — check debug screenshots")
        return True  # Continue anyway and see what happens

    # --------------------------------------------------------
    # Archive Scraping
    # --------------------------------------------------------

    def scrape_publication(self, pub: dict) -> dict:
        pub_id = pub["id"]
        archive_url = pub["archive_url"]

        print(f"\n{'='*60}")
        print(f"Scraping: {pub['name']}")
        print(f"{'='*60}")

        self.page.goto(archive_url, wait_until="networkidle")
        self._delay()
        self._save_debug(f"{pub_id}_archive")

        # Scroll to load all content (handle infinite scroll)
        self._scroll_to_bottom()

        html = self.page.content()
        soup = BeautifulSoup(html, "lxml")

        # Find issue links
        issues = self._find_issue_links(soup, archive_url, pub_id)
        print(f"  Found {len(issues)} issue links")

        if not issues:
            # Try alternate URLs
            for alt in [f"{archive_url}/archive", f"{BASE_URL}/members/{pub_id}"]:
                print(f"  Trying: {alt}")
                try:
                    self.page.goto(alt, wait_until="networkidle")
                    self._delay()
                    self._scroll_to_bottom()
                    html = self.page.content()
                    soup = BeautifulSoup(html, "lxml")
                    issues = self._find_issue_links(soup, alt, pub_id)
                    if issues:
                        print(f"  Found {len(issues)} issues at {alt}")
                        break
                except:
                    continue

        # Scrape portfolio page
        portfolio_data = self._scrape_portfolio_page(pub_id)

        # Scrape each issue
        all_issues = []
        all_picks = []

        for i, issue in enumerate(issues):
            print(f"\n  [{i+1}/{len(issues)}] {issue['title']}")
            try:
                self.page.goto(issue["url"], wait_until="networkidle")
                self._delay()

                html = self.page.content()
                soup = BeautifulSoup(html, "lxml")

                # Extract content
                content_area = (
                    soup.find("article") or
                    soup.find("div", class_=re.compile(r"content|entry|post|article|issue", re.I)) or
                    soup.find("main") or
                    soup.body
                )

                text = content_area.get_text(separator="\n", strip=True) if content_area else ""

                tables = []
                for table in (content_area or soup).find_all("table"):
                    rows = []
                    for tr in table.find_all("tr"):
                        cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                        if cells:
                            rows.append(cells)
                    if rows:
                        tables.append(rows)

                issue_data = {
                    **issue,
                    "full_text": text,
                    "tables": tables,
                    "html_length": len(html),
                }
                all_issues.append(issue_data)

                # Extract picks
                picks = self._extract_picks(issue_data)
                if picks:
                    print(f"    {len(picks)} picks found")
                    all_picks.extend(picks)

            except Exception as e:
                print(f"    ERROR: {e}")
                all_issues.append({**issue, "error": str(e)})

        return {
            "publication": pub,
            "issues": all_issues,
            "picks": all_picks,
            "portfolio": portfolio_data,
            "scraped_at": datetime.now().isoformat(),
        }

    def _scroll_to_bottom(self, max_scrolls: int = 10):
        """Scroll page to load lazy/infinite content."""
        for _ in range(max_scrolls):
            prev_height = self.page.evaluate("document.body.scrollHeight")
            self.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1)
            new_height = self.page.evaluate("document.body.scrollHeight")
            if new_height == prev_height:
                break

        # Also click "Load More" if present
        for sel in ['button:has-text("Load More")', 'a:has-text("Load More")',
                     'button:has-text("Show More")', '.load-more']:
            try:
                btn = self.page.query_selector(sel)
                if btn and btn.is_visible():
                    btn.click()
                    self.page.wait_for_load_state("networkidle", timeout=5000)
                    time.sleep(1)
            except:
                pass

    def _find_issue_links(self, soup, page_url, pub_id):
        """Same logic as requests-based scraper."""
        from urllib.parse import urljoin, urlparse

        issues = []
        seen = set()
        patterns = [pub_id, "issue", "newsletter", "update", "alert"]

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

            is_issue = any(pat in href_lower or pat in text_lower for pat in patterns)
            if re.search(r"/\d{4}/\d{2}", href) or re.search(r"issue[_-]?\d+", href_lower):
                is_issue = True

            if is_issue:
                date = self._extract_date(text) or self._extract_date_url(href)
                issues.append({"title": text, "url": full_url, "date": date})
                seen.add(full_url)

        if not issues:
            # Fallback: grab all internal links
            for a in soup.find_all("a", href=True):
                href = a["href"]
                full_url = urljoin(page_url, href)
                text = a.get_text(strip=True)
                if full_url in seen or not text or len(text) < 10:
                    continue
                parsed = urlparse(full_url)
                if parsed.netloc and "riskhedge.com" not in parsed.netloc:
                    continue
                if any(skip in href.lower() for skip in [
                    "login", "logout", "contact", "about", "privacy", "terms", "#"
                ]):
                    continue
                issues.append({"title": text, "url": full_url, "date": self._extract_date(text)})
                seen.add(full_url)

        issues.sort(key=lambda x: x.get("date") or "0000", reverse=True)
        return issues

    def _scrape_portfolio_page(self, pub_id):
        """Try to find the portfolio page."""
        urls = [
            f"{BASE_URL}/{pub_id}/portfolio",
            f"{BASE_URL}/members/{pub_id}/portfolio",
            f"{BASE_URL}/portfolio/{pub_id}",
        ]
        for url in urls:
            print(f"  Trying portfolio: {url}")
            try:
                self.page.goto(url, wait_until="networkidle")
                self._delay()
                html = self.page.content()
                soup = BeautifulSoup(html, "lxml")
                tables = soup.find_all("table")
                if tables:
                    print(f"  Found portfolio with {len(tables)} table(s)")
                    self._save_debug(f"{pub_id}_portfolio")
                    result = []
                    for table in tables:
                        rows = []
                        for tr in table.find_all("tr"):
                            cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
                            if cells:
                                rows.append(cells)
                        result.append(rows)
                    return {"url": url, "tables": result}
            except:
                continue
        return None

    def _extract_picks(self, issue_data):
        """Extract stock picks from issue data."""
        picks = []

        # From tables
        for table in issue_data.get("tables", []):
            if len(table) < 2:
                continue
            header = [h.lower() for h in table[0]]
            ticker_col = None
            for i, h in enumerate(header):
                if any(x in h for x in ["ticker", "symbol", "stock"]):
                    ticker_col = i
                    break
            if ticker_col is None:
                for i in range(len(header)):
                    count = sum(1 for r in table[1:] if len(r) > i and re.match(r'^[A-Z]{1,5}$', r[i].strip()))
                    if count >= 2:
                        ticker_col = i
                        break
            if ticker_col is not None:
                for row in table[1:]:
                    if len(row) <= ticker_col:
                        continue
                    ticker = row[ticker_col].strip().upper()
                    if re.match(r'^[A-Z]{1,5}$', ticker):
                        picks.append({
                            "ticker": ticker,
                            "date": issue_data.get("date"),
                            "source_issue": issue_data.get("title", ""),
                            "source_url": issue_data.get("url", ""),
                        })

        # From text
        if not picks:
            text = issue_data.get("full_text", "")
            for m in re.finditer(r'(?:buy|recommend)\s+([A-Z]{1,5})\b', text, re.I):
                ticker = m.group(1).upper()
                skip = {"THE","AND","FOR","ARE","BUT","NOT","YOU","ALL","CAN","HER","WAS",
                        "ONE","OUR","OUT","HAS","ITS","GDP","CEO","CFO","IPO","ETF","AI","US","SEC","FDA"}
                if ticker not in skip:
                    picks.append({
                        "ticker": ticker,
                        "date": issue_data.get("date"),
                        "source_issue": issue_data.get("title", ""),
                        "source_url": issue_data.get("url", ""),
                    })

        # Dedupe
        seen = set()
        return [p for p in picks if not (p["ticker"] in seen or seen.add(p["ticker"]))]

    def _extract_date(self, text):
        months = {"january":"01","february":"02","march":"03","april":"04","may":"05","june":"06",
                  "july":"07","august":"08","september":"09","october":"10","november":"11","december":"12",
                  "jan":"01","feb":"02","mar":"03","apr":"04","jun":"06","jul":"07",
                  "aug":"08","sep":"09","oct":"10","nov":"11","dec":"12"}
        for name, num in months.items():
            m = re.search(rf'\b{name}\w*\s+(\d{{1,2}},?\s+)?(\d{{4}})\b', text.lower())
            if m:
                return f"{m.group(2)}-{num}-01"
        return None

    def _extract_date_url(self, url):
        m = re.search(r'/(\d{4})/(\d{2})', url)
        return f"{m.group(1)}-{m.group(2)}-01" if m else None

    # --------------------------------------------------------
    # Run
    # --------------------------------------------------------

    def run(self, publication_ids=None):
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        self.start()

        try:
            if not self.login():
                print("Login failed!")
                sys.exit(1)

            pubs = PUBLICATIONS
            if publication_ids:
                pubs = [p for p in PUBLICATIONS if p["id"] in publication_ids]

            for pub in pubs:
                result = self.scrape_publication(pub)
                pid = pub["id"]

                for suffix, data in [
                    ("_issues.json", result["issues"]),
                    ("_picks.json", result["picks"]),
                ]:
                    path = os.path.join(OUTPUT_DIR, f"{pid}{suffix}")
                    with open(path, "w") as f:
                        json.dump(data, f, indent=2, default=str)
                    print(f"  Saved: {path}")

                # Portfolio format
                positions = []
                for i, pick in enumerate(result["picks"], 1):
                    positions.append({
                        "id": i, "newsletter": pid,
                        "ticker": pick["ticker"], "company": pick.get("company", ""),
                        "action": "Buy", "buyDate": pick.get("date"),
                        "buyPrice": None, "sellDate": None, "sellPrice": None,
                        "latestPrice": None, "status": "open",
                        "notes": f"Source: {pick.get('source_issue', '')}",
                    })
                portfolio = {
                    "newsletters": [{"id": pid, "name": pub["name"], "source": "RiskHedge"}],
                    "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
                    "positions": positions,
                }
                path = os.path.join(OUTPUT_DIR, f"{pid}_portfolio.json")
                with open(path, "w") as f:
                    json.dump(portfolio, f, indent=2)
                print(f"  Saved: {path}")

        finally:
            self.stop()

        print("\nDone! Check scraper/output/")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="RiskHedge scraper (browser-based)")
    parser.add_argument("-p", "--publications", nargs="+",
                        choices=[p["id"] for p in PUBLICATIONS])
    parser.add_argument("-e", "--email", default=os.environ.get("RH_EMAIL", ""))
    parser.add_argument("-w", "--password", default=os.environ.get("RH_PASSWORD", ""))
    parser.add_argument("--headless", action="store_true",
                        help="Run browser in headless mode (no visible window)")

    args = parser.parse_args()

    email = args.email or input("RiskHedge email: ")
    password = args.password
    if not password:
        import getpass
        password = getpass.getpass("RiskHedge password: ")

    scraper = RiskHedgeBrowserScraper(email, password, headless=args.headless)
    scraper.run(args.publications)
