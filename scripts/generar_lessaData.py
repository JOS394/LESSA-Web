import pdfplumber
import random
from pathlib import Path
import re

# Entrada/salida
PDF_PATH = Path(__file__).parent / "Lenguas-de-Senas-web.pdf"   # coloca aquí tu PDF
OUTPUT_PATH = Path(__file__).parent.parent / "src" / "data" / "lessaData.ts"

# Categorías según el PDF
CATEGORIES = [
    "Abecedario",
    "Números",
    "Saludos",
    "Días de la semana",
    "Meses del año",
    "Preguntas",
    "Nuevo ingreso",
    "Nombres de carreras",
    "Nombres de facultades",
    "Unidades Administrativas - Autoridades",
    "Modalidades de estudio",
    "Unidad de Educación Inclusiva",
    "Expediente en línea",
    "Nombres de la clase",
    "Trámites académicos",
    "Nombres del campus",
    "Nombres de redes sociales"
]

def normalize_line(s: str) -> str:
    s = s.strip()
    s = re.sub(r"\s+", " ", s)
    return s

def looks_like_title(line: str) -> bool:
    return line in CATEGORIES

def looks_like_word(line: str) -> bool:
    # heurística: líneas cortas (1-3 palabras)
    if not line: 
        return False
    if len(line.split()) > 3:
        return False
    if re.match(r"^\d{1,2}/\d{1,2}/\d{2,4}$", line):  # fechas
        return False
    return True

def generate_choices(word: str, words: list[str]) -> list[str]:
    distractors = [w for w in words if w != word]
    random.shuffle(distractors)
    selected = distractors[:3]
    choices = [word] + selected
    while len(choices) < 4:
        choices.append("Opción extra")
    random.shuffle(choices)
    return choices

def difficulty_for_category(cat: str) -> str:
    if cat in {"Abecedario", "Números", "Saludos", "Días de la semana", "Meses del año"}:
        return "fácil"
    if cat in {"Preguntas", "Nombres de la clase", "Trámites académicos"}:
        return "medio"
    return "difícil"

def main():
    if not PDF_PATH.exists():
        raise SystemExit(f"No se encontró el PDF en: {PDF_PATH}")

    category_words: dict[str, list[str]] = {}
    current_category: str | None = None

    with pdfplumber.open(PDF_PATH) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            lines = [normalize_line(ln) for ln in text.splitlines() if ln.strip()]
            for line in lines:
                if looks_like_title(line):
                    current_category = line
                    category_words.setdefault(current_category, [])
                    continue
                if current_category and looks_like_word(line):
                    if not category_words[current_category] or category_words[current_category][-1] != line:
                        category_words[current_category].append(line)

    # construir TS
    entries_ts: list[str] = []
    id_counter = 1
    for cat, words in category_words.items():
        for w in words:
            diff = difficulty_for_category(cat)
            choices = generate_choices(w, words)
            entry = f\"\"\"{{ id: {id_counter}, word: {w!r}, category: {cat!r}, difficulty: {diff!r}, description: 'Seña correspondiente a {w} en la categoría {cat}.', image: 'https://placehold.co/400x300/e0f2fe/1d4ed8?text={w}', choices: {choices} }}\"\"\"
            entries_ts.append(entry)
            id_counter += 1

    header = "export type LessaEntry = { id: number; word: string; category: string; difficulty: 'fácil' | 'medio' | 'difícil'; description: string; image: string; choices: string[] };\n\n"
    content = "export const lessaData: LessaEntry[] = [\n" + ",\n".join(entries_ts) + "\n];\n"
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(header + content, encoding="utf-8")
    print(f"Generado {OUTPUT_PATH} con {len(entries_ts)} entradas.")

if __name__ == '__main__':
    main()
