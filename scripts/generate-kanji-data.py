"""
Generate kanji.js from kanji_jlpt_only.json.

Usage:  python3 scripts/generate-kanji-data.py
Output: src/data/kanji.js  (overwrites existing file)
"""

import json, re, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "kanji_jlpt_only.json"
OUT = ROOT / "src" / "data" / "kanji.js"

GROUP_SIZE = 5

# ── katakana → hiragana helper ─────────────────────────────────
def kata_to_hira(s):
    return ''.join(
        chr(ord(c) - 0x60) if '\u30A1' <= c <= '\u30F6' else c
        for c in s
    )

# ── rough romaji from hiragana ─────────────────────────────────
HIRA_MAP = {
    'あ':'a','い':'i','う':'u','え':'e','お':'o',
    'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
    'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
    'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
    'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
    'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
    'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
    'や':'ya','ゆ':'yu','よ':'yo',
    'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
    'わ':'wa','ゐ':'wi','ゑ':'we','を':'wo','ん':'n',
    'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
    'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
    'だ':'da','ぢ':'di','づ':'du','で':'de','ど':'do',
    'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
    'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
    'きゃ':'kya','きゅ':'kyu','きょ':'kyo',
    'しゃ':'sha','しゅ':'shu','しょ':'sho',
    'ちゃ':'cha','ちゅ':'chu','ちょ':'cho',
    'にゃ':'nya','にゅ':'nyu','にょ':'nyo',
    'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo',
    'みゃ':'mya','みゅ':'myu','みょ':'myo',
    'りゃ':'rya','りゅ':'ryu','りょ':'ryo',
    'ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
    'じゃ':'ja','じゅ':'ju','じょ':'jo',
    'びゃ':'bya','びゅ':'byu','びょ':'byo',
    'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
    'っ':'Q',  # doubled consonant placeholder
}

def hira_to_romaji(s):
    result = []
    i = 0
    while i < len(s):
        # try 2-char combo first (for ya/yu/yo combos)
        if i + 1 < len(s) and s[i:i+2] in HIRA_MAP:
            result.append(HIRA_MAP[s[i:i+2]])
            i += 2
        elif s[i] in HIRA_MAP:
            result.append(HIRA_MAP[s[i]])
            i += 1
        elif s[i] == 'ー':  # long vowel mark
            i += 1
        else:
            result.append(s[i])
            i += 1
    rom = ''.join(result)
    # handle っ (double next consonant)
    rom = re.sub(r'Q([a-z])', r'\1\1', rom)
    rom = rom.replace('Q', '')
    # Don't insert apostrophe — it breaks JS strings and isn't needed for quiz
    return rom

# ── load JSON ──────────────────────────────────────────────────
with open(SRC) as f:
    raw = json.load(f)

# ── extract per level ──────────────────────────────────────────
by_level = {}  # jlpt -> list of dicts
for char, info in raw.items():
    jlpt = info.get('jlpt')
    if not jlpt:
        continue
    freq = info.get('freq_mainichi_shinbun')
    if freq is None:
        freq = 9999
    meanings = info.get('meanings', [])
    heisig = info.get('heisig_en', '')
    
    # Prefer heisig keyword (clean, single-word), fallback to first non-radical meaning
    meaning = ''
    if heisig and 'radical' not in heisig.lower():
        meaning = heisig.lower()
    else:
        for m in meanings:
            if 'radical' in m.lower():
                continue
            meaning = m.lower()
            break
    if not meaning and meanings:
        meaning = meanings[0].lower()

    kun = info.get('kun_readings', [])
    on = info.get('on_readings', [])
    reading = ''
    if kun:
        reading = kun[0].split('.')[0].replace('-', '')
    elif on:
        reading = kata_to_hira(on[0])
    if not meaning or not reading:
        continue

    romaji = hira_to_romaji(reading)

    by_level.setdefault(jlpt, []).append({
        'kanji': char,
        'meaning': meaning,
        'reading': reading,
        'romaji': romaji,
        'freq': freq,
    })

# sort each level by newspaper frequency (most common first)
for level in by_level:
    by_level[level].sort(key=lambda x: x['freq'])

# ── deduplicate IDs ────────────────────────────────────────────
used_ids = set()

def make_id(romaji, kanji):
    """Create a unique id from romaji, appending kanji unicode if collision."""
    base = re.sub(r'[^a-z0-9]', '', romaji)
    if not base:
        base = f'k{ord(kanji):x}'
    candidate = base
    suffix = 2
    while candidate in used_ids:
        candidate = f'{base}_{suffix}'
        suffix += 1
    used_ids.add(candidate)
    return candidate

# ── build JS output ────────────────────────────────────────────
# JLPT levels in order: N5 (5), N4 (4), N3 (3), N2 (2), N1 (1)
JLPT_ORDER = [5, 4, 3, 2, 1]
JLPT_NAMES = {5: 'N5', 4: 'N4', 3: 'N3', 2: 'N2', 1: 'N1'}

lines = []
lines.append('/**')
lines.append(' * Kanji data for JLPT N5–N1.')
lines.append(' * Auto-generated from kanji_jlpt_only.json.')
lines.append(' *')
lines.append(' * Each kanji has:')
lines.append(' *   id, kanji, meaning, reading, romaji, group, jlpt, similar')
lines.append(' */')
lines.append('')
lines.append('export const KANJI_LIST = [')

group_idx = 0
group_names = []
level_group_ranges = {}  # jlpt -> (first_group, last_group+1)

for jlpt in JLPT_ORDER:
    kanji_list = by_level.get(jlpt, [])
    if not kanji_list:
        continue

    first_group = group_idx
    # split into groups of GROUP_SIZE
    for i in range(0, len(kanji_list), GROUP_SIZE):
        chunk = kanji_list[i:i+GROUP_SIZE]
        # group name
        chunk_idx = i // GROUP_SIZE + 1
        total_groups = (len(kanji_list) + GROUP_SIZE - 1) // GROUP_SIZE
        gname = f'{JLPT_NAMES[jlpt]} · {chunk_idx}/{total_groups}'
        group_names.append(gname)

        lines.append(f'  // ── Group {group_idx}: {gname} ──')
        for k in chunk:
            kid = make_id(k['romaji'], k['kanji'])
            # escape single quotes in meaning
            meaning = k['meaning'].replace("'", "\\'")
            reading = k['reading']
            romaji = k['romaji']
            lines.append(
                f"  {{ id: '{kid}', kanji: '{k['kanji']}', meaning: '{meaning}', "
                f"reading: '{reading}', romaji: '{romaji}', "
                f"group: {group_idx}, jlpt: {jlpt}, similar: [] }},"
            )
        group_idx += 1

    level_group_ranges[jlpt] = (first_group, group_idx)

lines.append('];')
lines.append('')

# derived exports
lines.append('// ── Derived exports ───────────────────────────────────────────')
lines.append('')
lines.append('export const KANJI_BY_ID = Object.fromEntries(KANJI_LIST.map((k) => [k.id, k]));')
lines.append('')
lines.append('export const TOTAL_KANJI_GROUPS = Math.max(...KANJI_LIST.map((k) => k.group)) + 1;')
lines.append('')
lines.append('export function kanjiInGroup(group) {')
lines.append('  return KANJI_LIST.filter((k) => k.group === group);')
lines.append('}')
lines.append('')

# group names
lines.append('export const KANJI_GROUP_NAMES = [')
for gn in group_names:
    lines.append(f"  '{gn}',")
lines.append('];')
lines.append('')

# JLPT level boundaries
lines.append('/** JLPT level definitions: { jlpt, label, firstGroup, groupCount } */')
lines.append('export const JLPT_LEVELS = [')
for jlpt in JLPT_ORDER:
    if jlpt not in level_group_ranges:
        continue
    first, end = level_group_ranges[jlpt]
    count = end - first
    lines.append(f"  {{ jlpt: {jlpt}, label: '{JLPT_NAMES[jlpt]}', firstGroup: {first}, groupCount: {count} }},")
lines.append('];')
lines.append('')

# helper to get JLPT level for a group
lines.append('/** Get the JLPT level info for a given group index */')
lines.append('export function jlptForGroup(group) {')
lines.append('  return JLPT_LEVELS.find((l) => group >= l.firstGroup && group < l.firstGroup + l.groupCount);')
lines.append('}')
lines.append('')

OUT.write_text('\n'.join(lines))

# summary
print('Generated', OUT)
print(f'Total kanji: {sum(len(by_level.get(j, [])) for j in JLPT_ORDER)}')
print(f'Total groups: {group_idx}')
for jlpt in JLPT_ORDER:
    if jlpt in level_group_ranges:
        first, end = level_group_ranges[jlpt]
        kcount = len(by_level.get(jlpt, []))
        print(f'  {JLPT_NAMES[jlpt]}: {kcount} kanji, groups {first}–{end-1}')
