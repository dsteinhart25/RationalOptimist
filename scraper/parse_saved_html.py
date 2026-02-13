#!/usr/bin/env python3
"""
Parse Saved HTML Files
=======================
Fallback tool for when the browser scraper can't reach the site.

How to use:
  1. Login to riskhedge.com in your normal browser
  2. Navigate to the portfolio page (or any page with a positions table)
  3. Save the page: Ctrl+S (or Cmd+S on Mac) → save as "Complete webpage"
  4. Put the saved .html file(s) in a folder
  5. Run this script pointing at that folder

Usage:
    python3 parse_saved_html.py ./saved_pages/
    python3 parse_saved_html.py ./saved_pages/ --pub disruption-x
    python3 parse_saved_html.py portfolio_page.html --pub disruption-x

Output:
    scraper/output/{pub_id}_portfolio.json   (matches src/data/portfolio.json format)
"""

import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

from bs4 import BeautifulSoup

# Import the table parsing logic from the browser scraper
from rh_scraper_browser import (
    parse_portfolio_table,
    normalize_position,
    PUBLICATIONS,
)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "output")


def parse_html_file(filepath: str) -> list[dict]:
    """Parse a single HTML file and extract portfolio positions."""
    print(f"  Parsing: {filepath}")

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "lxml")
    all_positions = []

    # Find all tables and try to parse them as portfolio tables
    tables = soup.find_all("table")
    print(f"    Found {len(tables)} table(s)")

    for i, table in enumerate(tables):
        rows = []
        for tr in table.find_all("tr"):
            cells = [td.get_text(strip=True) for td in tr.find_all(["td", "th"])]
            if cells:
                rows.append(cells)

        if rows:
            print(f"    Table {i+1}: {len(rows)} rows, {len(rows[0])} columns")
            if rows[0]:
                print(f"    Headers: {rows[0][:6]}...")

            positions = parse_portfolio_table(rows)
            if positions:
                print(f"    → Extracted {len(positions)} positions")
                all_positions.extend(positions)
            else:
                print(f"    → No positions found (no ticker column detected)")

    if not all_positions:
        print("    No tables with position data found.")
        print("    Tip: Make sure you saved a page that has a portfolio table.")

    return all_positions


def build_portfolio_json(pub_id: str, positions: list[dict]) -> dict:
    """Build the portfolio.json structure."""
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
            "url": f"https://www.riskhedge.com/{pub_id}",
        }],
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "positions": normalized,
    }


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Parse saved HTML files to extract portfolio data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 parse_saved_html.py ./saved_pages/
  python3 parse_saved_html.py portfolio.html --pub disruption-x
  python3 parse_saved_html.py *.html --pub disruption-investor
        """
    )
    parser.add_argument(
        "paths",
        nargs="+",
        help="HTML file(s) or directory containing HTML files"
    )
    parser.add_argument(
        "--pub", "--publication",
        default="disruption-x",
        choices=[p["id"] for p in PUBLICATIONS],
        help="Publication ID (default: disruption-x)"
    )

    args = parser.parse_args()

    # Collect all HTML files
    html_files = []
    for path in args.paths:
        p = Path(path)
        if p.is_dir():
            html_files.extend(sorted(p.glob("**/*.html")))
            html_files.extend(sorted(p.glob("**/*.htm")))
        elif p.is_file():
            html_files.append(p)
        else:
            print(f"WARNING: {path} not found, skipping")

    if not html_files:
        print("ERROR: No HTML files found.")
        print("Provide HTML files or a directory containing them.")
        sys.exit(1)

    print(f"Found {len(html_files)} HTML file(s)")

    # Parse all files
    all_positions = []
    for filepath in html_files:
        positions = parse_html_file(str(filepath))
        all_positions.extend(positions)

    if not all_positions:
        print("\nNo positions extracted from any file.")
        print("Make sure the HTML files contain portfolio tables with ticker symbols.")
        sys.exit(1)

    # Deduplicate by ticker (keep first occurrence)
    seen = set()
    unique = []
    for pos in all_positions:
        if pos["ticker"] not in seen:
            seen.add(pos["ticker"])
            unique.append(pos)

    print(f"\nExtracted {len(unique)} unique positions")

    # Build and save output
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    portfolio = build_portfolio_json(args.pub, unique)

    output_path = os.path.join(OUTPUT_DIR, f"{args.pub}_portfolio.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(portfolio, f, indent=2, default=str)

    print(f"\nSaved: {output_path}")
    print(f"\nTo use in the app:")
    print(f"  cp {output_path} src/data/portfolio.json")

    # Also print a summary
    print(f"\nPositions found:")
    for pos in portfolio["positions"]:
        price = f"${pos['buyPrice']}" if pos['buyPrice'] else "N/A"
        print(f"  {pos['ticker']:6s}  {pos['company'][:30]:30s}  {pos['action']:10s}  {price}")


if __name__ == "__main__":
    main()
