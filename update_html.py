#!/usr/bin/env python3
import sys
import re

def update_html(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            contents = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        sys.exit(1)

    # Replace occurrences of src="image... with src="img/image...
    updated = re.sub(r'src="([^"]*)"', r'src="img/\1"', contents)

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated)
    except Exception as e:
        print(f"Error writing {file_path}: {e}")
        sys.exit(1)

    print(f"Updated image paths in {file_path}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: update_html.py <html_file>")
        sys.exit(1)
    update_html(sys.argv[1])
