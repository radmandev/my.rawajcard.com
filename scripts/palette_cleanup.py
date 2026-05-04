#!/usr/bin/env python3
"""
Palette cleanup: replace teal- with cyan- (accents) or fuchsia/purple (CTA buttons),
and strip dark: variants from modified lines.
"""

import os
import re
import sys

# Patterns for CTA/primary action button gradients using from-teal on gradient-to-r
# These should become fuchsia-600 to-purple-700
CTA_GRADIENT_PATTERNS = [
    # bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600
    (
        re.compile(
            r'bg-gradient-to-r\s+from-teal-\d+(?:\s+via-\w+-\d+)?\s+to-(?:teal|blue|cyan)-\d+'
            r'(?:\s+hover:from-teal-\d+(?:\s+hover:via-\w+-\d+)?\s+hover:to-(?:teal|blue|cyan)-\d+)?'
        ),
        'bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600'
    ),
    # bg-gradient-to-l from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400
    (
        re.compile(
            r'bg-gradient-to-l\s+from-teal-\d+\s+to-teal-\d+'
            r'(?:\s+hover:from-teal-\d+\s+hover:to-teal-\d+)?'
        ),
        'bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600'
    ),
]

# shadow-teal- on CTA -> shadow-fuchsia-500/30
def replace_shadow_cta(s):
    return re.sub(r'shadow-teal-\d+/\d+', 'shadow-fuchsia-500/30', s)

def replace_shadow_cta_plain(s):
    return re.sub(r'shadow-teal-\d+', 'shadow-fuchsia-500/30', s)

# General teal -> cyan replacements (non-CTA)
TEAL_TO_CYAN = re.compile(r'\b((?:text|bg|border|ring|shadow|from|to|via|hover:border|hover:bg|hover:text|hover:from|hover:to|hover:ring|focus:ring|focus:border|focus:bg|group-hover:text|group-hover:bg|active:bg|placeholder:text)-?)teal(-\d+(?:/\d+)?)')

def apply_cta_gradients(line):
    for pattern, replacement in CTA_GRADIENT_PATTERNS:
        line = pattern.sub(replacement, line)
    return line

def remove_dark_variants(line):
    # Remove dark:anything (word boundary based)
    line = re.sub(r'\s+dark:[^\s"\'`]+', '', line)
    return line

def process_line(line, modified):
    original = line
    line = apply_cta_gradients(line)
    # replace teal with cyan in non-CTA contexts
    line = TEAL_TO_CYAN.sub(lambda m: m.group(1) + 'cyan' + m.group(2), line)
    # shadow-teal cleanup (after general replacement it won't match if already done, but handle remaining)
    # (already covered by TEAL_TO_CYAN)
    if line != original:
        line = remove_dark_variants(line)
        modified[0] += 1
    return line

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'teal-' not in content:
        return False, 0
    
    lines = content.split('\n')
    new_lines = []
    count = [0]
    for line in lines:
        new_lines.append(process_line(line, count))
    
    new_content = '\n'.join(new_lines)
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True, count[0]
    return False, 0

def find_files(root):
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip node_modules, .git, etc
        dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.git', 'dist', 'build', '.next')]
        for fname in filenames:
            if fname.endswith(('.js', '.jsx', '.ts', '.tsx')):
                yield os.path.join(dirpath, fname)

if __name__ == '__main__':
    src_root = sys.argv[1] if len(sys.argv) > 1 else 'src'
    changed_files = []
    total_changes = 0
    for filepath in find_files(src_root):
        changed, count = process_file(filepath)
        if changed:
            rel = os.path.relpath(filepath, os.path.dirname(src_root))
            changed_files.append((rel, count))
            total_changes += count
    
    print(f"\n=== Palette Cleanup Complete ===")
    print(f"Files changed: {len(changed_files)}")
    print(f"Lines modified: {total_changes}")
    print("\nChanged files:")
    for f, c in sorted(changed_files):
        print(f"  {f} ({c} lines)")
