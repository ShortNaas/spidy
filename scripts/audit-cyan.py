import os
import re

# Obfuscated to avoid self-matching during codebase text search
pats = [
    'c' + 'yan',
    't' + 'eal',
    's' + 'ky-',
    '#06b6d4',
    '#22d3ee',
    '#0e7490',
    '#083344',
    '#0891b2',
    '#67e8f9',
    r'rgba\(34,211,238',
    r'rgba\(6,182,212',
    '--color-' + 'live',
    'live' + '-deep',
    'ring-' + 'live',
    'border-' + 'live',
    'bg-' + 'live',
    'text-' + 'live',
    'hatch-' + 'live',
    r'lineColors\.' + 'live',
]

regex = re.compile('|'.join(pats), re.IGNORECASE)

ignore_dirs = {'.git', 'node_modules', '.next', 'test-results', 'screenshots'}
ignore_files = {'CYAN-AUDIT.md', 'AGENT-PROMPT-remove-cyan.md', 'audit-cyan.py'}
binary_exts = {'.png', '.jpg', '.jpeg', '.ico', '.webp', '.gif', '.woff', '.woff2', '.ttf', '.eot'}

results = {}

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for file in sorted(files):
        if file in ignore_files:
            continue
        ext = os.path.splitext(file)[1].lower()
        if ext in binary_exts:
            continue
        filepath = os.path.join(root, file)
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                file_hits = []
                for i, line in enumerate(lines):
                    if regex.search(line):
                        file_hits.append((i + 1, line.rstrip('\n\r')))
                if file_hits:
                    results[filepath] = file_hits
        except Exception:
            pass

audit_content = [
    '# Cyan Audit\n\nComprehensive inventory of all cyan, teal, sky, legacy live tokens, and blue-green color occurrences across the repository.\n\n'
]

total_hits = sum(len(h) for h in results.values())
audit_content.append(f'**Total Files Affected:** {len(results)}\n\n')
audit_content.append(f'**Total Hits:** {total_hits}\n\n')

categories = {
    'Tokens & Styles': [],
    'Primitives & UI Components': [],
    'Visualizations': [],
    'Pages & App Routes': [],
    'Tests & E2E': [],
    'Documentation & Configuration': [],
}

for path, hits in sorted(results.items()):
    clean_path = path.lstrip('./')
    if clean_path.startswith('app/globals.css') or clean_path.startswith('lib/theme.ts'):
        categories['Tokens & Styles'].append((clean_path, hits))
    elif clean_path.startswith('components/ui'):
        categories['Primitives & UI Components'].append((clean_path, hits))
    elif clean_path.startswith('components/viz'):
        categories['Visualizations'].append((clean_path, hits))
    elif (
        clean_path.startswith('app/')
        or clean_path.startswith('components/dashboard')
        or clean_path.startswith('components/landing')
    ):
        categories['Pages & App Routes'].append((clean_path, hits))
    elif clean_path.startswith('tests/'):
        categories['Tests & E2E'].append((clean_path, hits))
    else:
        categories['Documentation & Configuration'].append((clean_path, hits))

for cat, files in categories.items():
    audit_content.append(f'## {cat}\n\n')
    if not files:
        audit_content.append('None\n\n')
        continue
    for path, hits in files:
        audit_content.append(f'### `{path}` ({len(hits)} hits)\n\n')
        audit_content.append('| Line | Content |\n|---|---|\n')
        for line_no, content in hits:
            escaped = content.replace('|', '\\|').replace('`', "'")
            audit_content.append(f'| {line_no} | `{escaped}` |\n')
        audit_content.append('\n')

with open('CYAN-AUDIT.md', 'w', encoding='utf-8') as f:
    f.write(''.join(audit_content))

print(f'Wrote CYAN-AUDIT.md with {total_hits} hits across {len(results)} files')
