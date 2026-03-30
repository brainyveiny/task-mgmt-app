import os
import re


def clean_file(file_path):
    print(f"Cleaning: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # 1. Strip trailing whitespace from every line
    content = re.sub(r'[ \t]+$', '', content, flags=re.MULTILINE)
    # 2. Collapse multiple blank lines into a single one
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    # 3. Specific formatting refinements for compactness
    # Ensure exactly one blank line before classes/methods/etc if they weren't already jammed
    # Actually, the user just added a blank line between methods. I'll make it consistent.
    # Add a blank line before common blocks if missing (for readability they requested)

    if file_path.endswith('.ts'):
        # Add blank line before decorator if missing
        content = re.sub(r'([^\n])\n@Component', r'\1\n\n@Component', content)
        # Add blank line before methods if missing
        content = re.sub(r'}\n\s+public', r'}\n\n    public', content)
        content = re.sub(r'}\n\s+private', r'}\n\n    private', content)
        content = re.sub(r'}\n\s+constructor', r'}\n\n    constructor', content)

    if file_path.endswith('.py'):
        # Add blank line before top level functions
        content = re.sub(r'([^\n])\ndef ', r'\1\n\ndef ', content)
        content = re.sub(r'([^\n])\nasync def ', r'\1\n\nasync def ', content)
        # Add blank line before decorators
        content = re.sub(r'([^\n])\n@', r'\1\n\n@', content)
# 4. Final multi-line collapse
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    # 5. Remove blank lines at the start of blocks (internal padding)
    content = re.sub(r'{\n\s*\n', '{\n', content) # JS/TS
    content = re.sub(r':\n\s*\n', ':\n', content) # Python
    # 6. Remove blank lines right before the end of blocks
    content = re.sub(r'\n\s*\n\s*}', '\n    }', content)
    # Remove extra spaces in JSON (if any)

    if file_path.endswith('.json'):
        import json

        try:
            data = json.loads(content)
            content = json.dumps(data, indent=2)
        except:
            pass

    with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content.strip() + '\n')


def walk_and_clean(directory_path, extensions):
    for root, dirs, files in os.walk(directory_path):
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.angular', 'venv', '__pycache__', 'dist', '.pytest_cache']]

        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                clean_file(os.path.join(root, file))
if __name__ == "__main__":
    base_dir = r"c:\Users\vamshi\OneDrive\Desktop\saksoft\Task mgmt app"
    exts = ['.ts', '.py', '.html', '.css', '.json']
    walk_and_clean(base_dir, exts)
    print("Cleanup complete.")
