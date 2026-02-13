#!/usr/bin/env python3
"""
RiskHedge Newsletter Scraper
=============================
Scrapes stock picks and portfolio data from RiskHedge paid publications.

Usage:
    python3 rh_scraper.py

Requirements:
    pip install requests beautifulsoup4 lxml

Output:
    - scraper/output/disruption_investor_issues.json   (all issue metadata + content)
    - scraper/output/disruption_investor_picks.json     (extracted stock picks)
    - scraper/output/disruption_investor_portfolio.json  (portfolio format matching src/data/portfolio.json)
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import os
import time
import sys
from datetime import datetime
from urllib.parse import urljoin, urlparse

# ============================================================
# Configuration
# ============================================================

BASE_URL = "https://www.riskhedge.com"
LOGIN_URL = f"{BASE_URL}/members/login"

# Credentials - will be read from env vars or prompted
EMAIL = os.environ.get("RH_EMAIL", "")
PASSWORD = os.environ.get("RH_PASSWORD", "")

# Publications to scrape (in order)
PUBLICATIONS = [
    {
        "id": "disruption-investor",
        "name": "Disruption Investor",
        "archive_url": f"{BASE_URL}/disruption-investor",
        "portfolio_slug": "disruption-investor",
    },
    {
        "id": "disruption-x",
        "name": "Disruption X",
        "archive_url": f"{BASE_URL}/disruption-x",
        "portfolio_slug": "disruption-x",
    },
    {
        "id": "express-trader",
        "name": "Express Trader",
        "archive_url": f"{BASE_URL}/express-trader",
        "portfolio_slug": "express-trader",
    },
]

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")

# Rate limiting
REQUEST_DELAY = 1.5  # seconds between requests


# ============================================================
# Session Management
# ============================================================

class RiskHedgeScraper:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        })
        self.logged_in = False

    def _delay(self):
        """Rate limit requests."""
        time.sleep(REQUEST_DELAY)

    def _get(self, url: str, **kwargs) -> requests.Response:
        """GET with rate limiting and error handling."""
        self._delay()
        resp = self.session.get(url, **kwargs)
        resp.raise_for_status()
        return resp

    def _post(self, url: str, **kwargs) -> requests.Response:
        """POST with rate limiting and error handling."""
        self._delay()
        resp = self.session.post(url, **kwargs)
        return resp

    def _soup(self, resp: requests.Response) -> BeautifulSoup:
        """Parse response as HTML."""
        return BeautifulSoup(resp.text, "lxml")

    # --------------------------------------------------------
    # Authentication
    # --------------------------------------------------------

    def login(self) -> bool:
        """
        Authenticate with RiskHedge.
        Dynamically discovers the login form structure (CSRF tokens, field names, etc.)
        """
        print("=== Logging in to RiskHedge ===")

        # Step 1: Fetch the login page to get form structure + cookies
        print(f"  Fetching login page: {LOGIN_URL}")
        resp = self._get(LOGIN_URL, allow_redirects=True)
        soup = self._soup(resp)

        # Step 2: Find the login form
        form = self._find_login_form(soup)
        if not form:
            print("  ERROR: Could not find login form on page.")
            print("  Dumping page title:", soup.title.string if soup.title else "N/A")
            self._dump_debug("login_page.html", resp.text)
            return False

        # Step 3: Build form data
        action = form.get("action", LOGIN_URL)
        if not action.startswith("http"):
            action = urljoin(LOGIN_URL, action)
        method = form.get("method", "post").lower()

        form_data = {}
        for inp in form.find_all("input"):
            name = inp.get("name")
            if not name:
                continue
            value = inp.get("value", "")
            form_data[name] = value

        # Fill in credentials - try common field names
        email_fields = ["email", "username", "login", "user_email", "log", "user"]
        password_fields = ["password", "pass", "pwd", "user_password", "user_pass"]

        email_set = False
        pass_set = False
        for key in form_data:
            key_lower = key.lower()
            if any(f in key_lower for f in email_fields) and not email_set:
                form_data[key] = self.email
                email_set = True
                print(f"  Found email field: {key}")
            elif any(f in key_lower for f in password_fields) and not pass_set:
                form_data[key] = self.password
                pass_set = True
                print(f"  Found password field: {key}")

        if not email_set or not pass_set:
            print(f"  WARNING: Could not auto-detect form fields. Trying manual mapping.")
            print(f"  Form fields found: {list(form_data.keys())}")
            # Fallback: try first text/email input for email, first password for password
            for inp in form.find_all("input"):
                itype = inp.get("type", "text").lower()
                name = inp.get("name", "")
                if itype in ("text", "email") and not email_set and name:
                    form_data[name] = self.email
                    email_set = True
                    print(f"  Using field '{name}' for email")
                elif itype == "password" and not pass_set and name:
                    form_data[name] = self.password
                    pass_set = True
                    print(f"  Using field '{name}' for password")

        # Also check for meta CSRF token (Laravel-style)
        meta_csrf = soup.find("meta", {"name": "csrf-token"})
        if meta_csrf:
            token = meta_csrf.get("content", "")
            self.session.headers["X-CSRF-TOKEN"] = token
            print(f"  Found meta CSRF token")

        print(f"  Submitting login to: {action}")
        print(f"  Form fields: {[k for k in form_data if 'pass' not in k.lower()]}")

        # Step 4: Submit login
        if method == "post":
            resp = self._post(action, data=form_data, allow_redirects=True)
        else:
            resp = self._get(action, params=form_data, allow_redirects=True)

        # Step 5: Check if login succeeded
        final_url = resp.url
        print(f"  Post-login URL: {final_url}")
        print(f"  Status code: {resp.status_code}")

        soup = self._soup(resp)

        # Check for common login failure indicators
        error_indicators = [
            "invalid", "incorrect", "wrong", "failed", "error",
            "try again", "not found", "unauthorized"
        ]
        alerts = soup.find_all(class_=re.compile(r"alert|error|message|notice|flash", re.I))
        for alert in alerts:
            text = alert.get_text(strip=True).lower()
            if any(ind in text for ind in error_indicators):
                print(f"  LOGIN FAILED: {alert.get_text(strip=True)}")
                return False

        # Check for success indicators
        if "/login" not in final_url.lower():
            print("  Login appears successful (redirected away from login page)")
            self.logged_in = True
            return True

        # Check for member-only content
        member_indicators = ["dashboard", "portfolio", "logout", "my account", "member"]
        page_text = soup.get_text().lower()
        if any(ind in page_text for ind in member_indicators):
            print("  Login appears successful (found member content)")
            self.logged_in = True
            return True

        print("  Login status uncertain. Saving page for debug.")
        self._dump_debug("post_login.html", resp.text)
        # Assume success and try to continue
        self.logged_in = True
        return True

    def _find_login_form(self, soup: BeautifulSoup):
        """Find the login form on the page."""
        # Try various strategies
        # 1. Form with password input
        for form in soup.find_all("form"):
            if form.find("input", {"type": "password"}):
                return form

        # 2. Form with action containing "login"
        for form in soup.find_all("form"):
            action = (form.get("action") or "").lower()
            if "login" in action or "auth" in action or "sign" in action:
                return form

        # 3. Any form on the page
        forms = soup.find_all("form")
        if len(forms) == 1:
            return forms[0]

        return None

    # --------------------------------------------------------
    # Archive Scraping
    # --------------------------------------------------------

    def scrape_publication(self, pub: dict) -> dict:
        """
        Scrape all issues for a publication.
        Returns dict with issue metadata, content, and extracted picks.
        """
        pub_id = pub["id"]
        pub_name = pub["name"]
        archive_url = pub["archive_url"]

        print(f"\n{'='*60}")
        print(f"Scraping: {pub_name}")
        print(f"Archive URL: {archive_url}")
        print(f"{'='*60}")

        # Step 1: Fetch the archive/main page
        resp = self._get(archive_url, allow_redirects=True)
        soup = self._soup(resp)

        print(f"  Page title: {soup.title.string if soup.title else 'N/A'}")
        self._dump_debug(f"{pub_id}_archive.html", resp.text)

        # Step 2: Find issue links
        issues = self._find_issue_links(soup, archive_url, pub_id)
        print(f"  Found {len(issues)} issue links")

        if not issues:
            # Try alternate archive patterns
            alt_urls = [
                f"{archive_url}/archive",
                f"{archive_url}/issues",
                f"{BASE_URL}/members/{pub_id}",
                f"{BASE_URL}/members/{pub_id}/archive",
            ]
            for alt_url in alt_urls:
                print(f"  Trying alternate URL: {alt_url}")
                try:
                    resp = self._get(alt_url, allow_redirects=True)
                    soup = self._soup(resp)
                    issues = self._find_issue_links(soup, alt_url, pub_id)
                    if issues:
                        print(f"  Found {len(issues)} issues at {alt_url}")
                        break
                except Exception as e:
                    print(f"  Failed: {e}")

        # Step 3: Also look for a portfolio page
        portfolio_data = self._scrape_portfolio_page(pub)

        # Step 4: Scrape each issue
        all_issues = []
        all_picks = []

        for i, issue in enumerate(issues):
            print(f"\n  [{i+1}/{len(issues)}] Scraping: {issue['title']}")
            print(f"    URL: {issue['url']}")

            try:
                issue_data = self._scrape_issue(issue)
                all_issues.append(issue_data)

                # Extract picks from this issue
                picks = self._extract_picks_from_issue(issue_data)
                if picks:
                    print(f"    Found {len(picks)} picks")
                    all_picks.extend(picks)
                else:
                    print(f"    No picks extracted")

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

    def _find_issue_links(self, soup: BeautifulSoup, page_url: str, pub_id: str) -> list:
        """
        Find all issue links on an archive page.
        Tries multiple strategies to detect the list.
        """
        issues = []
        seen_urls = set()

        # Strategy 1: Look for links containing publication name or "issue"
        patterns = [pub_id, "issue", "newsletter", "update", "alert"]
        for a in soup.find_all("a", href=True):
            href = a["href"]
            full_url = urljoin(page_url, href)
            text = a.get_text(strip=True)

            # Skip empty, navigation, and external links
            if not text or len(text) < 5:
                continue
            if full_url in seen_urls:
                continue
            parsed = urlparse(full_url)
            if parsed.netloc and "riskhedge.com" not in parsed.netloc:
                continue

            href_lower = href.lower()
            text_lower = text.lower()

            # Match links that look like newsletter issues
            is_issue = False
            for pat in patterns:
                if pat in href_lower or pat in text_lower:
                    is_issue = True
                    break

            # Also match date-pattern URLs like /2024/01/ or /issue-123
            if re.search(r"/\d{4}/\d{2}", href) or re.search(r"issue[_-]?\d+", href_lower):
                is_issue = True

            if is_issue:
                issues.append({
                    "title": text,
                    "url": full_url,
                    "date": self._extract_date_from_text(text) or self._extract_date_from_url(href),
                })
                seen_urls.add(full_url)

        # Strategy 2: Look for a list/grid of articles
        if not issues:
            # Find the main content area with the most links
            containers = soup.find_all(["div", "section", "main", "ul"])
            for container in containers:
                links = container.find_all("a", href=True)
                if len(links) >= 5:  # Likely an archive listing
                    for a in links:
                        href = a["href"]
                        full_url = urljoin(page_url, href)
                        text = a.get_text(strip=True)
                        if full_url in seen_urls or not text or len(text) < 10:
                            continue
                        parsed = urlparse(full_url)
                        if parsed.netloc and "riskhedge.com" not in parsed.netloc:
                            continue
                        # Skip obvious nav/footer links
                        if any(skip in href.lower() for skip in [
                            "login", "logout", "contact", "about", "privacy",
                            "terms", "faq", "support", "#"
                        ]):
                            continue
                        issues.append({
                            "title": text,
                            "url": full_url,
                            "date": self._extract_date_from_text(text),
                        })
                        seen_urls.add(full_url)

        # Strategy 3: Check for pagination and follow "next" links
        next_page = self._find_next_page(soup, page_url)
        if next_page and len(issues) > 0:
            print(f"    Found pagination, following: {next_page}")
            try:
                resp = self._get(next_page)
                more_soup = self._soup(resp)
                more_issues = self._find_issue_links(more_soup, next_page, pub_id)
                issues.extend(more_issues)
            except Exception as e:
                print(f"    Pagination error: {e}")

        # Sort by date if available
        issues.sort(key=lambda x: x.get("date") or "0000-00-00", reverse=True)

        return issues

    def _find_next_page(self, soup: BeautifulSoup, current_url: str) -> str | None:
        """Find a 'next page' or 'load more' link."""
        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True).lower()
            classes = " ".join(a.get("class", []))
            if any(x in text for x in ["next", "older", "more", "load more"]):
                return urljoin(current_url, a["href"])
            if "next" in classes or "pagination-next" in classes:
                return urljoin(current_url, a["href"])
        return None

    def _scrape_issue(self, issue: dict) -> dict:
        """Scrape a single issue page."""
        resp = self._get(issue["url"], allow_redirects=True)
        soup = self._soup(resp)

        # Extract the main content
        content_area = (
            soup.find("article") or
            soup.find("div", class_=re.compile(r"content|entry|post|article|issue", re.I)) or
            soup.find("main") or
            soup.body
        )

        # Get text content
        text = content_area.get_text(separator="\n", strip=True) if content_area else ""

        # Find any tables (portfolio tables)
        tables = []
        for table in (content_area or soup).find_all("table"):
            table_data = self._parse_table(table)
            if table_data:
                tables.append(table_data)

        # Find any images (charts, etc.)
        images = []
        for img in (content_area or soup).find_all("img", src=True):
            images.append({
                "src": urljoin(issue["url"], img["src"]),
                "alt": img.get("alt", ""),
            })

        return {
            **issue,
            "full_text": text,
            "tables": tables,
            "image_count": len(images),
            "html_length": len(resp.text),
        }

    def _parse_table(self, table_el) -> list[list[str]]:
        """Parse an HTML table into a list of rows."""
        rows = []
        for tr in table_el.find_all("tr"):
            cells = []
            for td in tr.find_all(["td", "th"]):
                cells.append(td.get_text(strip=True))
            if cells:
                rows.append(cells)
        return rows

    # --------------------------------------------------------
    # Portfolio Page Scraping
    # --------------------------------------------------------

    def _scrape_portfolio_page(self, pub: dict) -> dict | None:
        """
        Try to find and scrape the model portfolio page.
        This is often the most valuable data source — a single table with all picks.
        """
        pub_id = pub["id"]
        portfolio_urls = [
            f"{BASE_URL}/{pub_id}/portfolio",
            f"{BASE_URL}/members/{pub_id}/portfolio",
            f"{BASE_URL}/{pub_id}#portfolio",
            f"{BASE_URL}/portfolio/{pub_id}",
            f"{BASE_URL}/members/portfolio/{pub_id}",
        ]

        for url in portfolio_urls:
            print(f"  Trying portfolio URL: {url}")
            try:
                resp = self._get(url, allow_redirects=True)
                if resp.status_code == 200 and len(resp.text) > 500:
                    soup = self._soup(resp)

                    # Look for tables
                    tables = soup.find_all("table")
                    if tables:
                        print(f"  Found portfolio page with {len(tables)} table(s) at {url}")
                        portfolio_data = {
                            "url": url,
                            "tables": [self._parse_table(t) for t in tables],
                        }
                        self._dump_debug(f"{pub_id}_portfolio.html", resp.text)
                        return portfolio_data

                    # Maybe it's a card/list layout instead of table
                    cards = soup.find_all(class_=re.compile(r"card|pick|stock|position|holding", re.I))
                    if cards:
                        print(f"  Found {len(cards)} card-style positions at {url}")
                        portfolio_data = {
                            "url": url,
                            "cards": [c.get_text(separator="\n", strip=True) for c in cards],
                        }
                        self._dump_debug(f"{pub_id}_portfolio.html", resp.text)
                        return portfolio_data

            except Exception as e:
                continue

        print(f"  No portfolio page found for {pub_id}")
        return None

    # --------------------------------------------------------
    # Pick Extraction
    # --------------------------------------------------------

    def _extract_picks_from_issue(self, issue_data: dict) -> list:
        """
        Extract stock pick recommendations from an issue.
        Looks for patterns like ticker symbols, buy/sell actions, prices.
        """
        picks = []
        text = issue_data.get("full_text", "")

        # Extract from tables first (most reliable)
        for table in issue_data.get("tables", []):
            table_picks = self._extract_picks_from_table(table, issue_data)
            picks.extend(table_picks)

        # Extract from text (fallback)
        if not picks:
            text_picks = self._extract_picks_from_text(text, issue_data)
            picks.extend(text_picks)

        return picks

    def _extract_picks_from_table(self, table: list[list[str]], issue_data: dict) -> list:
        """Extract picks from a portfolio-style table."""
        if not table or len(table) < 2:
            return []

        picks = []
        header = [h.lower().strip() for h in table[0]]

        # Try to identify column indices
        col_map = {}
        for i, h in enumerate(header):
            if any(x in h for x in ["ticker", "symbol", "stock"]):
                col_map["ticker"] = i
            elif any(x in h for x in ["company", "name"]):
                col_map["company"] = i
            elif any(x in h for x in ["buy", "entry", "rec", "price"]) and "date" not in h:
                col_map["buy_price"] = i
            elif any(x in h for x in ["date", "added", "recommended"]):
                col_map["date"] = i
            elif any(x in h for x in ["action", "status", "rating"]):
                col_map["action"] = i
            elif any(x in h for x in ["stop", "loss"]):
                col_map["stop_loss"] = i
            elif any(x in h for x in ["target", "upside"]):
                col_map["target"] = i
            elif any(x in h for x in ["return", "gain", "change", "p&l", "pnl"]):
                col_map["return"] = i

        if "ticker" not in col_map:
            # Try to find ticker column by content (3-5 uppercase letters)
            for i in range(len(header)):
                ticker_count = sum(
                    1 for row in table[1:]
                    if len(row) > i and re.match(r'^[A-Z]{1,5}$', row[i].strip())
                )
                if ticker_count >= 2:
                    col_map["ticker"] = i
                    break

        if "ticker" not in col_map:
            return []

        # Extract rows
        for row in table[1:]:
            if len(row) <= col_map["ticker"]:
                continue

            ticker = row[col_map["ticker"]].strip().upper()
            if not re.match(r'^[A-Z]{1,5}$', ticker):
                continue

            pick = {
                "ticker": ticker,
                "company": row[col_map["company"]].strip() if "company" in col_map and len(row) > col_map["company"] else "",
                "buy_price": self._parse_price(row[col_map["buy_price"]]) if "buy_price" in col_map and len(row) > col_map["buy_price"] else None,
                "date": row[col_map["date"]].strip() if "date" in col_map and len(row) > col_map["date"] else issue_data.get("date"),
                "action": row[col_map["action"]].strip() if "action" in col_map and len(row) > col_map["action"] else "Buy",
                "stop_loss": self._parse_price(row[col_map["stop_loss"]]) if "stop_loss" in col_map and len(row) > col_map["stop_loss"] else None,
                "source_issue": issue_data.get("title", ""),
                "source_url": issue_data.get("url", ""),
            }
            picks.append(pick)

        return picks

    def _extract_picks_from_text(self, text: str, issue_data: dict) -> list:
        """Extract picks from free-form text using regex patterns."""
        picks = []

        # Pattern: "Buy TICKER" or "Recommended: TICKER" or "Action: Buy TICKER"
        buy_patterns = [
            r'(?:buy|recommend|action[:\s]+buy)\s+([A-Z]{1,5})\b',
            r'(?:ticker|symbol)[:\s]+([A-Z]{1,5})\b',
            r'(?:new\s+pick|new\s+recommendation)[:\s]*([A-Z]{1,5})\b',
        ]

        for pattern in buy_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                ticker = match.group(1).upper()
                # Skip common false positives
                if ticker in {"THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL",
                              "CAN", "HER", "WAS", "ONE", "OUR", "OUT", "HAS", "ITS",
                              "GDP", "CEO", "CFO", "IPO", "ETF", "NYSE", "AI", "US",
                              "USA", "SEC", "FDA", "NASDAQ"}:
                    continue
                picks.append({
                    "ticker": ticker,
                    "company": "",
                    "buy_price": None,
                    "date": issue_data.get("date"),
                    "action": "Buy",
                    "source_issue": issue_data.get("title", ""),
                    "source_url": issue_data.get("url", ""),
                })

        # Deduplicate by ticker
        seen = set()
        unique_picks = []
        for p in picks:
            if p["ticker"] not in seen:
                seen.add(p["ticker"])
                unique_picks.append(p)

        return unique_picks

    # --------------------------------------------------------
    # Helpers
    # --------------------------------------------------------

    def _parse_price(self, text: str) -> float | None:
        """Parse a price string like '$12.34' or '12.34'."""
        if not text:
            return None
        match = re.search(r'\$?\s*([\d,]+\.?\d*)', text.replace(",", ""))
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass
        return None

    def _extract_date_from_text(self, text: str) -> str | None:
        """Try to extract a date from text."""
        # "January 2024", "Jan 2024", "01/2024"
        months = {
            "january": "01", "february": "02", "march": "03", "april": "04",
            "may": "05", "june": "06", "july": "07", "august": "08",
            "september": "09", "october": "10", "november": "11", "december": "12",
            "jan": "01", "feb": "02", "mar": "03", "apr": "04",
            "jun": "06", "jul": "07", "aug": "08", "sep": "09",
            "oct": "10", "nov": "11", "dec": "12",
        }

        text_lower = text.lower()
        for month_name, month_num in months.items():
            pattern = rf'\b{month_name}\w*\s+(\d{{1,2}},?\s+)?(\d{{4}})\b'
            match = re.search(pattern, text_lower)
            if match:
                year = match.group(2)
                day = match.group(1)
                if day:
                    day = re.sub(r'[,\s]', '', day).zfill(2)
                else:
                    day = "01"
                return f"{year}-{month_num}-{day}"

        # "2024-01-15" or "01/15/2024"
        iso_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', text)
        if iso_match:
            return iso_match.group(0)

        us_match = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})', text)
        if us_match:
            return f"{us_match.group(3)}-{us_match.group(1).zfill(2)}-{us_match.group(2).zfill(2)}"

        return None

    def _extract_date_from_url(self, url: str) -> str | None:
        """Try to extract a date from a URL path."""
        match = re.search(r'/(\d{4})/(\d{2})', url)
        if match:
            return f"{match.group(1)}-{match.group(2)}-01"
        return None

    def _dump_debug(self, filename: str, content: str):
        """Save HTML for debugging."""
        debug_dir = os.path.join(OUTPUT_DIR, "debug")
        os.makedirs(debug_dir, exist_ok=True)
        path = os.path.join(debug_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [debug] Saved: {path}")

    # --------------------------------------------------------
    # Output Formatting
    # --------------------------------------------------------

    def to_portfolio_json(self, pub_id: str, picks: list, portfolio_data: dict | None) -> dict:
        """
        Convert scraped picks into the portfolio.json format used by the app.
        """
        positions = []
        for i, pick in enumerate(picks, start=1):
            positions.append({
                "id": i,
                "newsletter": pub_id,
                "ticker": pick["ticker"],
                "company": pick.get("company", ""),
                "action": pick.get("action", "Buy"),
                "buyDate": pick.get("date"),
                "buyPrice": pick.get("buy_price"),
                "sellDate": None,
                "sellPrice": None,
                "latestPrice": None,
                "freeRideDate": None,
                "freeRidePct": None,
                "freeRidePrice": None,
                "stopLoss": pick.get("stop_loss"),
                "positionSize": "Full",
                "status": "open",
                "guidance": "",
                "notes": f"Source: {pick.get('source_issue', '')}",
            })

        return {
            "newsletters": [{
                "id": pub_id,
                "name": next((p["name"] for p in PUBLICATIONS if p["id"] == pub_id), pub_id),
                "source": "RiskHedge",
                "url": f"{BASE_URL}/{pub_id}",
            }],
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "positions": positions,
        }

    # --------------------------------------------------------
    # Main Runner
    # --------------------------------------------------------

    def run(self, publication_ids: list[str] | None = None):
        """Run the scraper for specified publications."""
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Login
        if not self.login():
            print("\nFATAL: Login failed. Please check your credentials.")
            print("You can set them via environment variables:")
            print("  export RH_EMAIL='your@email.com'")
            print("  export RH_PASSWORD='yourpassword'")
            sys.exit(1)

        # Filter publications
        pubs_to_scrape = PUBLICATIONS
        if publication_ids:
            pubs_to_scrape = [p for p in PUBLICATIONS if p["id"] in publication_ids]

        all_results = {}

        for pub in pubs_to_scrape:
            result = self.scrape_publication(pub)
            all_results[pub["id"]] = result

            # Save results
            pub_id = pub["id"]

            # Raw issues data
            issues_path = os.path.join(OUTPUT_DIR, f"{pub_id}_issues.json")
            with open(issues_path, "w") as f:
                json.dump(result["issues"], f, indent=2, default=str)
            print(f"\n  Saved {len(result['issues'])} issues to: {issues_path}")

            # Extracted picks
            picks_path = os.path.join(OUTPUT_DIR, f"{pub_id}_picks.json")
            with open(picks_path, "w") as f:
                json.dump(result["picks"], f, indent=2, default=str)
            print(f"  Saved {len(result['picks'])} picks to: {picks_path}")

            # Portfolio format
            portfolio = self.to_portfolio_json(pub_id, result["picks"], result.get("portfolio"))
            portfolio_path = os.path.join(OUTPUT_DIR, f"{pub_id}_portfolio.json")
            with open(portfolio_path, "w") as f:
                json.dump(portfolio, f, indent=2, default=str)
            print(f"  Saved portfolio to: {portfolio_path}")

        print(f"\n{'='*60}")
        print("SCRAPING COMPLETE")
        print(f"{'='*60}")
        for pub_id, result in all_results.items():
            print(f"  {pub_id}: {len(result['issues'])} issues, {len(result['picks'])} picks")
        print(f"\nAll output saved to: {OUTPUT_DIR}")
        print(f"Debug HTML saved to: {OUTPUT_DIR}/debug/")

        return all_results


# ============================================================
# CLI Entry Point
# ============================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Scrape RiskHedge newsletter archives")
    parser.add_argument(
        "--publications", "-p",
        nargs="+",
        choices=[p["id"] for p in PUBLICATIONS],
        default=None,
        help="Which publications to scrape (default: all)"
    )
    parser.add_argument(
        "--email", "-e",
        default=EMAIL,
        help="RiskHedge login email (or set RH_EMAIL env var)"
    )
    parser.add_argument(
        "--password", "-w",
        default=PASSWORD,
        help="RiskHedge login password (or set RH_PASSWORD env var)"
    )

    args = parser.parse_args()

    email = args.email
    password = args.password

    if not email:
        email = input("RiskHedge email: ")
    if not password:
        import getpass
        password = getpass.getpass("RiskHedge password: ")

    scraper = RiskHedgeScraper(email, password)
    scraper.run(args.publications)
