from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
ARCO = ROOT / "arco.html"
FONT_DIR = ROOT / "assets" / "fonts"

LATIN_RANGE = (
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, "
    "U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, "
    "U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
)


def font_face(family: str, weight: int, filename: str) -> str:
    return f"""@font-face {{
  font-family: '{family}';
  font-style: normal;
  font-weight: {weight};
  font-display: swap;
  src: url(\"assets/fonts/{filename}\") format('woff2');
  unicode-range: {LATIN_RANGE};
}}"""


FONT_BLOCK = "<style>\n" + "\n".join(
    [font_face("Azeret Mono", w, "azeret-mono-latin.woff2") for w in (400, 500, 700)]
    + [font_face("Commissioner", w, "commissioner-latin.woff2") for w in (300, 400, 500, 600, 700)]
    + [font_face("Schibsted Grotesk", w, "schibsted-grotesk-latin.woff2") for w in (400, 500, 600, 700)]
) + "\n</style>"


class Parser(HTMLParser):
    pass


def strip_decorative_html_comments(text: str) -> tuple[str, int]:
    removed = 0

    exact = {"PERCURSO", "CONCEPT READER"}
    prefixes = (
        "a marca pessoal na aba:",
        "CORDÃO UMBILICAL",
        "kit v1.2, matriz 06:",
        "os contatos falam a mesma língua",
        "IDENTIDADE CONCEITUAL",
    )

    def repl(match: re.Match[str]) -> str:
        nonlocal removed
        body = match.group(1).strip()
        decorative = (
            "====" in body
            or "----------" in body
            or body in exact
            or body.startswith(prefixes)
        )
        if decorative:
            removed += 1
            return ""
        return match.group(0)

    return re.sub(r"<!--(.*?)-->", repl, text, flags=re.S), removed


def strip_css_section_banners(text: str) -> tuple[str, int]:
    removed = 0
    style_re = re.compile(r"<style>(.*?)</style>", re.S)

    def clean_style(style_match: re.Match[str]) -> str:
        nonlocal removed
        css = style_match.group(1)

        def repl(comment_match: re.Match[str]) -> str:
            nonlocal removed
            body = comment_match.group(1).strip()
            decorative = (
                "====" in body
                or "----------" in body
                or body in {"Palco", "Hover territorial", "Tátil"}
            )
            if decorative:
                removed += 1
                return ""
            return comment_match.group(0)

        return "<style>" + re.sub(r"/\*(.*?)\*/", repl, css, flags=re.S) + "</style>"

    return style_re.sub(clean_style, text), removed


def replace_font_block(text: str) -> tuple[str, int]:
    pattern = re.compile(r"<style>/\* latin-ext \*/.*?</style>", re.S)
    match = pattern.search(text)
    if not match:
        raise RuntimeError("Bloco original de @font-face não localizado; abortando.")
    old = match.group(0)
    count = old.count("@font-face")
    if count != 44:
        raise RuntimeError(f"Esperados 44 @font-face no bloco original; encontrados {count}. Abortando.")
    return text[: match.start()] + FONT_BLOCK + text[match.end() :], count - 12


def validate_structure(before: str, after: str) -> None:
    critical_tokens = (
        '<main class="stage" id="stage"',
        'data-view="home"',
        'data-view="echo"',
        'data-view="atrio"',
        'id="repertorio"',
        'id="reader"',
        'id="tale-echo"',
        'id="tale-atrio"',
        'id="progress-rail"',
    )
    for token in critical_tokens:
        if before.count(token) != after.count(token):
            raise RuntimeError(f"Estrutura crítica alterada para {token!r}; abortando.")

    for tag in ("script", "section", "details", "iframe", "dialog"):
        if before.count(f"<{tag}") != after.count(f"<{tag}"):
            raise RuntimeError(f"Contagem de <{tag}> mudou; abortando.")

    if "commissioner-cyrillic" in after or "commissioner-greek" in after or "commissioner-vietnamese" in after:
        raise RuntimeError("Subset não latino permaneceu no arco.html.")

    if after.count("@font-face") != 12:
        raise RuntimeError(f"Esperados 12 @font-face após limpeza; encontrados {after.count('@font-face')}.")

    if after.count('.rail__link[aria-current="true"]::after{ width:100%; }') != 1:
        raise RuntimeError("A regra duplicada do rail não foi normalizada para uma ocorrência.")

    parser = Parser(convert_charrefs=False)
    parser.feed(after)
    parser.close()


def validate_javascript(html: str) -> None:
    scripts = re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", html, flags=re.S | re.I)
    if not scripts:
        raise RuntimeError("Nenhum <script> encontrado para validação.")

    with tempfile.TemporaryDirectory() as td:
        for idx, source in enumerate(scripts, start=1):
            path = Path(td) / f"arco-script-{idx}.js"
            path.write_text(source, encoding="utf-8")
            subprocess.run(["node", "--check", str(path)], check=True, capture_output=True, text=True)


def referenced_font_names() -> set[str]:
    extensions = {".html", ".css", ".js", ".md", ".json", ".yml", ".yaml", ".txt"}
    refs: set[str] = set()
    for path in ROOT.rglob("*"):
        if not path.is_file() or ".git" in path.parts or path.suffix.lower() not in extensions:
            continue
        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for name in re.findall(r"[A-Za-z0-9._-]+\.woff2", content):
            refs.add(name)
    return refs


def remove_orphan_fonts() -> list[str]:
    if not FONT_DIR.exists():
        return []
    refs = referenced_font_names()
    removed: list[str] = []
    for font in sorted(FONT_DIR.glob("*.woff2")):
        if font.name not in refs:
            font.unlink()
            removed.append(font.name)
    return removed


def main() -> None:
    before = ARCO.read_text(encoding="utf-8")
    text, removed_font_faces = replace_font_block(before)
    text, removed_html_comments = strip_decorative_html_comments(text)
    text, removed_css_comments = strip_css_section_banners(text)

    duplicate = '.rail__link[aria-current="true"]::after{ width:100%; }\n.rail__link[aria-current="true"]::after{ width:100%; }'
    if duplicate not in text:
        raise RuntimeError("Regra duplicada esperada do rail não foi localizada; abortando para evitar edição fora do estado auditado.")
    text = text.replace(duplicate, '.rail__link[aria-current="true"]::after{ width:100%; }', 1)

    text = text.replace('    /* PENDENTE: mais concept readers conforme você escrever. */\n', '', 1)

    validate_structure(before, text)
    validate_javascript(text)
    ARCO.write_text(text, encoding="utf-8")

    orphan_fonts = remove_orphan_fonts()

    print(f"@font-face removidos: {removed_font_faces}")
    print(f"comentários HTML decorativos removidos: {removed_html_comments}")
    print(f"banners/comentários CSS decorativos removidos: {removed_css_comments}")
    print("regra CSS duplicada removida: 1")
    print(f"fontes órfãs removidas: {len(orphan_fonts)}")
    for name in orphan_fonts:
        print(f"  - {name}")


if __name__ == "__main__":
    main()
