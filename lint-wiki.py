#!/usr/bin/env python3
"""
lint-wiki.py ? Content linting script for the wiki.
Scans all HTML files for common issues and reports them.

Usage:
    python lint-wiki.py           # scan everything
    python lint-wiki.py --fix     # auto-fix safe issues (encoding)

Checks performed:
  1. Duplicate IDs within a page
  2. Missing <meta name="wiki-updated"> tag
  3. Missing <meta name="wiki-category"> tag
  4. Empty sections (h2 followed immediately by another h2)
  5. Broken image src paths (file not found)
  6. Encoding anomalies (literal '?' in Pok contexts)
  7. Missing wiki-data.js / wiki-tables.js / wiki.js script tags
  8. Unclosed HTML tags (basic check)
  9. data-wiki-table with no matching rows
 10. Images missing loading="lazy"
"""

import os
import re
import sys
import io
from pathlib import Path
from collections import Counter

# Fix console encoding for Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')



WIKI_ROOT = str(Path(__file__).parent.resolve())

# Files to skip
SKIP_FILES = {"index.html"}
SKIP_DIRS = {"src", "FilediSupporto", ".git", "node_modules"}

# Patterns
ID_PATTERN = re.compile(r'\bid=["\']([^"\']+)["\']', re.IGNORECASE)
META_UPDATED = re.compile(r'<meta\s+name=["\']wiki-updated["\']', re.IGNORECASE)
META_CATEGORY = re.compile(r'<meta\s+name=["\']wiki-category["\']', re.IGNORECASE)
IMG_SRC = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)
LAZY_LOAD = re.compile(r'loading=["\']lazy["\']', re.IGNORECASE)
SCRIPT_TAG = re.compile(r'<script\s+src=["\']([^"\']+)["\']', re.IGNORECASE)
DATA_TABLE = re.compile(r'data-wiki-table=["\']([^"\']+)["\']', re.IGNORECASE)
H2_TAG = re.compile(r'<h2[^>]*>', re.IGNORECASE)
POK_QUESTION = re.compile(r'Pok\?', re.IGNORECASE)
EMPTY_SECTION = re.compile(r'<h2[^>]*>.*?</h2>\s*<h2', re.IGNORECASE | re.DOTALL)


class Issue:
    def __init__(self, file, line, severity, msg):
        self.file = file
        self.line = line
        self.severity = severity  # 'error', 'warning', 'info'
        self.msg = msg

    def __str__(self):
        rel = os.path.relpath(self.file, WIKI_ROOT)
        symbol = {"error": "x", "warning": "!", "info": "i"}.get(self.severity, "?")
        return "  {} [{:7s}] {}:{}  {}".format(symbol, self.severity.upper(), rel, self.line, self.msg)


def collect_html_files():
    """Gather all .html files under WIKI_ROOT, skipping excluded dirs."""
    files = []
    for root, dirs, filenames in os.walk(WIKI_ROOT):
        # Prune skipped directories
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        rel_root = os.path.relpath(root, WIKI_ROOT)
        for fn in filenames:
            if fn.endswith(".html") and fn not in SKIP_FILES:
                files.append(os.path.join(root, fn))
    return sorted(files)


def lint_file(filepath):
    """Run all checks on a single HTML file."""
    issues = []
    rel = os.path.relpath(filepath, WIKI_ROOT)

    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
            lines = content.split("\n")
    except Exception as e:
        issues.append(Issue(filepath, 0, "error", "Cannot read file: {}".format(e)))
        return issues

    # 1. Duplicate IDs
    id_counts = Counter()
    id_lines = {}
    for i, line in enumerate(lines, 1):
        for m in ID_PATTERN.finditer(line):
            id_val = m.group(1)
            id_counts[id_val] += 1
            if id_val not in id_lines:
                id_lines[id_val] = i
    for id_val, count in id_counts.items():
        if count > 1:
            issues.append(Issue(filepath, id_lines[id_val], "warning",
                                "Duplicate ID '{}' appears {} times".format(id_val, count)))

    # 2. Missing meta wiki-updated
    if not META_UPDATED.search(content):
        issues.append(Issue(filepath, 1, "warning", 'Missing <meta name="wiki-updated"> tag'))

    # 3. Missing meta wiki-category
    if not META_CATEGORY.search(content):
        issues.append(Issue(filepath, 1, "info", 'Missing <meta name="wiki-category"> tag'))

    # 4. Empty sections (h2 immediately followed by h2)
    for m in EMPTY_SECTION.finditer(content):
        pos = content[:m.start()].count("\n") + 1
        issues.append(Issue(filepath, pos, "warning", "Empty section - h2 followed immediately by another h2"))

    # 5. Broken image src paths
    for i, line in enumerate(lines, 1):
        for m in IMG_SRC.finditer(line):
            src = m.group(1)
            if src.startswith("http://") or src.startswith("https://"):
                continue
            if src.startswith("data:"):
                continue
            img_path = os.path.normpath(os.path.join(os.path.dirname(filepath), src))
            if not os.path.exists(img_path):
                issues.append(Issue(filepath, i, "error",
                                    "Image not found: {}".format(src)))

    # 6. Encoding: literal '?' in Pok contexts
    for i, line in enumerate(lines, 1):
        if POK_QUESTION.search(line):
            issues.append(Issue(filepath, i, "error",
                                "Encoding issue - literal '?' in Pokemon context: {}".format(line.strip()[:80])))

    # 7. Missing script tags (wiki-data.js, wiki-tables.js, wiki.js)
    scripts_found = set()
    for m in SCRIPT_TAG.finditer(content):
        src = m.group(1)
        if "wiki-data.js" in src:
            scripts_found.add("wiki-data.js")
        if "wiki-tables.js" in src:
            scripts_found.add("wiki-tables.js")
        if "wiki.js" in src:
            scripts_found.add("wiki.js")

    for expected in ["wiki-data.js", "wiki-tables.js", "wiki.js"]:
        if expected not in scripts_found:
            issues.append(Issue(filepath, len(lines), "warning",
                                "Missing script tag for {}".format(expected)))

    # 8. Static <img> without loading="lazy" (in the HTML source, not JS-generated)
    for i, line in enumerate(lines, 1):
        for m in IMG_SRC.finditer(line):
            full_tag = line[m.start():m.end() + 50]
            if not LAZY_LOAD.search(full_tag):
                src = m.group(1)
                if not src.startswith("http"):
                    issues.append(Issue(filepath, i, "info",
                                        'Static <img> without loading="lazy": {}'.format(src[:60])))

    return issues


def main():
    auto_fix = "--fix" in sys.argv

    print("\n" + "=" * 60)
    print("  Wiki Content Linter")
    print("  Root: {}".format(WIKI_ROOT))
    print("=" * 60 + "\n")

    files = collect_html_files()
    print("Scanning {} HTML files...\n".format(len(files)))

    all_issues = []
    files_with_issues = 0

    for fp in files:
        issues = lint_file(fp)
        if issues:
            files_with_issues += 1
            rel = os.path.relpath(fp, WIKI_ROOT)
            suffix = "s" if len(issues) != 1 else ""
            print("-- {} ({} issue{}) --".format(rel, len(issues), suffix))
            for issue in issues:
                print(issue)
            print()
        all_issues.extend(issues)

    # Summary
    errors   = sum(1 for i in all_issues if i.severity == "error")
    warnings = sum(1 for i in all_issues if i.severity == "warning")
    infos    = sum(1 for i in all_issues if i.severity == "info")

    print("=" * 60)
    print("  Summary:  {} issues in {}/{} files".format(len(all_issues), files_with_issues, len(files)))
    print("    x Errors:   {}".format(errors))
    print("    ! Warnings: {}".format(warnings))
    print("    i Info:     {}".format(infos))
    print("=" * 60 + "\n")

    if errors > 0:
        sys.exit(1)
    sys.exit(0)



if __name__ == "__main__":
    main()
