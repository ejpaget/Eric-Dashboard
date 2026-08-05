"""Collect public RSS headlines and write the dashboard's news.json file.

This uses only Python's standard library so GitHub Actions can run it without
installing packages or storing API keys.
"""

from __future__ import annotations

import email.utils
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path


FEEDS = [
    {
        "category": "Local",
        "source": "The Union",
        "url": "https://www.theunion.com/search/?f=rss&t=article&l=50&s=start_time&sd=desc",
        "limit": 6,
    },
    {
        "category": "Local",
        "source": "Google News local results",
        "url": "https://news.google.com/rss/search?q=Grass+Valley+California&hl=en-US&gl=US&ceid=US:en",
        "limit": 6,
    },
    {
        "category": "World",
        "source": "BBC News",
        "url": "https://feeds.bbci.co.uk/news/world/rss.xml",
        "limit": 6,
    },
    {
        "category": "Sports",
        "source": "ESPN",
        "url": "https://www.espn.com/espn/rss/news",
        "limit": 6,
    },
    {
        "category": "Science & Tech",
        "source": "BBC Science",
        "url": "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
        "limit": 3,
    },
    {
        "category": "Science & Tech",
        "source": "BBC Technology",
        "url": "https://feeds.bbci.co.uk/news/technology/rss.xml",
        "limit": 3,
    },
]

TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")


def clean_text(value: str | None) -> str:
    """Convert RSS HTML fragments to readable plain text."""
    without_tags = TAG_RE.sub(" ", value or "")
    return SPACE_RE.sub(" ", html.unescape(without_tags)).strip()


def iso_date(value: str | None) -> str:
    """Normalize common RSS dates for reliable display in the browser."""
    if not value:
        return ""
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    except (TypeError, ValueError):
        return value


def read_feed(feed: dict[str, object]) -> list[dict[str, str]]:
    request = urllib.request.Request(
        str(feed["url"]),
        headers={"User-Agent": "EricDashboard/1.0 (+https://github.com/ejpaget/Eric-Dashboard)"},
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        root = ET.fromstring(response.read())

    stories = []
    for item in root.findall("./channel/item")[: int(feed["limit"])]:
        title = clean_text(item.findtext("title"))
        link = clean_text(item.findtext("link"))
        if not title or not link:
            continue
        stories.append(
            {
                "category": str(feed["category"]),
                "source": clean_text(item.findtext("source")) or str(feed["source"]),
                "title": title,
                "summary": clean_text(item.findtext("description")),
                "url": link,
                "publishedAt": iso_date(item.findtext("pubDate")),
            }
        )
    return stories


def main() -> None:
    collected_stories: list[dict[str, str]] = []
    errors: list[str] = []

    for feed in FEEDS:
        try:
            collected_stories.extend(read_feed(feed))
        except Exception as error:  # One failed publisher should not empty the feed.
            errors.append(f"{feed['source']}: {error}")

    if not collected_stories:
        raise RuntimeError("Every news feed failed; keeping the existing news.json")

    # Keep each category balanced. Because The Union appears before the local
    # fallback, its stories are preferred whenever that feed is available.
    stories: list[dict[str, str]] = []
    category_counts: dict[str, int] = {}
    for story in collected_stories:
        category = story["category"]
        if category_counts.get(category, 0) >= 6:
            continue
        stories.append(story)
        category_counts[category] = category_counts.get(category, 0) + 1

    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "stories": stories,
        "feedErrors": errors,
    }
    output_path = Path(__file__).resolve().parents[1] / "news.json"
    output_path.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(stories)} stories to {output_path}")
    if errors:
        print("Unavailable feeds: " + "; ".join(errors))


if __name__ == "__main__":
    main()
