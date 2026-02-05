import re

with open('events.json', 'r') as f:
    txt = f.read()

# Find all problematic double-quotes in title fields
# German closing quote (") followed by JSON string close (")
# Fix by escaping the German quote or removing it
lines = txt.split('\n')
fixed = []
for line in lines:
    # Pattern: value ending with ""  (two regular quotes before comma)
    # This happens when German „..." quotes have the closing " as U+0022
    if '"title"' in line and line.rstrip().endswith('"",'):
        # Remove the extra quote before the JSON closing quote
        line = line.rstrip()
        # Find the last "", and replace with ",
        line = line[:-3] + '",'
    fixed.append(line)

txt = '\n'.join(fixed)

import json
data = json.loads(txt)
print(f'Total events: {len(data["events"])}')

regions = {}
for e in data['events']:
    r = e.get('region', 'MISSING')
    regions[r] = regions.get(r, 0) + 1
for k, v in sorted(regions.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v}')

# Also print unique locations
locations = set()
for e in data['events']:
    locations.add(e.get('location', 'MISSING'))
print(f'\nUnique locations ({len(locations)}):')
for loc in sorted(locations):
    print(f'  {loc}')

# Write fixed JSON
with open('events.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('\nJSON fixed and written.')
