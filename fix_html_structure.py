import re
from pathlib import Path


def fix_nested_html(file_path: Path) -> bool:
    content = file_path.read_text(encoding='utf-8')

    pattern = re.compile(
        r'(<div class="display-inner">.*?)(<!DOCTYPE html>.*?<body.*?>)(.*?)(</body>\s*</html>)(.*?</div>)',
        re.DOTALL
    )

    match = pattern.search(content)
    if not match:
        return False

    print(f"Found nested HTML in {file_path}")
    pre_inner_div = match.group(1)
    inner_body_content = match.group(3)
    post_inner_div = match.group(5)

    new_embedded_content = f"{pre_inner_div}{inner_body_content}{post_inner_div}"
    new_content = content[:match.start()] + new_embedded_content + content[match.end():]

    file_path.write_text(new_content, encoding='utf-8')
    print(f"Fixed nested HTML in {file_path}")
    return True


def main():
    repo_root = Path(__file__).resolve().parents[1]
    html_dir = repo_root / "[HTML]" / "Directories"

    if not html_dir.exists():
        print(f"No HTML directory found at {html_dir}")
        return

    html_files = sorted(html_dir.glob('*.html'))
    fixed_count = 0

    for file_path in html_files:
        if fix_nested_html(file_path):
            fixed_count += 1

    print(f"Processed {len(html_files)} files, fixed {fixed_count} with nested HTML.")


if __name__ == "__main__":
    main()
