#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
import re

def scrape_a64_instructions(url):
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, 'html.parser')

    # Grab every <a> inside a <span class="insnheading">
    anchors = soup.select('span.insnheading > a')
    raw = [a.get_text().strip().lower() for a in anchors]

    # Strip off any "(...)" suffix so "add (immediate)" → "add"
    base = [re.match(r'^[^ (\n]+', m).group(0) for m in raw]

    # Dedupe while preserving original order
    seen = set()
    unique = []
    for instr in base:
        if instr not in seen:
            seen.add(instr)
            unique.append(instr)

    return unique

def main():
    url = 'https://www.scs.stanford.edu/~zyedidia/arm64/'
    instrs = scrape_a64_instructions(url)
    with open('a64_instructions.json', 'w') as f:
        json.dump(instrs, f, indent=2)
    print(f'Wrote {len(instrs)} instructions to a64_instructions.json')

if __name__ == '__main__':
    main()
