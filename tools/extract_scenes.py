#!/usr/bin/env python3
"""青空文庫 XHTML から感情語が明記された場面を抽出する試作スクリプト。

使い方: python3 tools/extract_scenes.py data/aozora/*.html
出力: data/candidates.json と data/candidates_preview.md
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEXICON = ROOT / "data" / "emotion_lexicon.json"

CONTEXT_BEFORE = 3  # 感情語の前に付ける文数
CONTEXT_AFTER = 1   # 後ろに付ける文数
MAX_PASSAGE_CHARS = 400  # これを超えたら前方の文脈から削る

# 感情語に見えて感情ではない定型表現(variant + 直後の文字列で判定)
EXCLUDE_AFTER = {
    "ほっと": ["い", "け"],   # ほっといて/ほっとけ = 放っておく
    "落ち着い": ["ている事", "ていること"],
    "落ちつい": ["ている事", "ていること"],
}


def load_lexicon():
    data = json.loads(LEXICON.read_text(encoding="utf-8"))
    entries = []  # (variant, word, category) 長い variant を優先してマッチ
    for cat, words in data["categories"].items():
        for w in words:
            for v in w["variants"]:
                entries.append((v, w["word"], cat))
    entries.sort(key=lambda e: -len(e[0]))
    return entries


def read_aozora(path: Path) -> tuple[str, str, str]:
    """(title, author, main_text) を返す。青空文庫 XHTML は Shift_JIS。"""
    raw = path.read_bytes()
    text = raw.decode("cp932", errors="replace")
    m = re.search(r"<title>(.*?)</title>", text)
    title_line = html.unescape(m.group(1)) if m else path.stem
    # 青空文庫の title は「作者名 作品名」形式
    parts = title_line.split(maxsplit=1)
    author, title = (parts[0], parts[1]) if len(parts) == 2 else ("不明", title_line)
    m = re.search(
        r'<div class="main_text">(.*?)<div class="bibliographical_information"',
        text, re.S,
    ) or re.search(r'<div class="main_text">(.*?)</div>', text, re.S)
    body = m.group(1) if m else text
    # ルビ: <ruby><rb>漢字</rb>...<rt>よみ</rt>...</ruby> → 漢字
    body = re.sub(r"<ruby><rb>(.*?)</rb>.*?</ruby>", r"\1", body, flags=re.S)
    body = re.sub(r"<br\s*/?>", "\n", body)
    body = re.sub(r"<[^>]+>", "", body)
    body = html.unescape(body)
    body = re.sub(r"[ \t　]+", lambda m: "　" if "　" in m.group(0) else " ", body)
    return title, author, body


def split_sentences(text: str) -> list[str]:
    """雑な文分割: 。!?で切る。閉じ括弧は前の文に付ける。"""
    text = re.sub(r"\n+", "\n", text).strip()
    sents = re.split(r"(?<=[。!?！？])(?![」』）\)])", text)
    out = []
    for s in sents:
        s = s.strip()
        if s:
            out.extend(p.strip() for p in s.split("\n") if p.strip())
    return out


def extract(path: Path, lexicon):
    title, author, body = read_aozora(path)
    sents = split_sentences(body)
    candidates = []
    last_hit = {}  # word -> 文番号(同じ語の近接重複を除く)
    for i, sent in enumerate(sents):
        for variant, word, cat in lexicon:
            pos = sent.find(variant)
            if pos < 0:
                continue
            follow = sent[pos + len(variant):pos + len(variant) + 6]
            if any(follow.startswith(x) for x in EXCLUDE_AFTER.get(variant, [])):
                continue
            if word in last_hit and i - last_hit[word] <= CONTEXT_BEFORE + CONTEXT_AFTER:
                continue  # 直前の候補と窓が重なる同一語はスキップ
            last_hit[word] = i
            start = max(0, i - CONTEXT_BEFORE)
            end = min(len(sents), i + 1 + CONTEXT_AFTER)
            window = sents[start:end]
            hit_idx = i - start
            # 文字数上限: 感情語を含む文を残しつつ前方から削る
            while len("".join(window)) > MAX_PASSAGE_CHARS and hit_idx > 0:
                window.pop(0)
                hit_idx -= 1
            passage = "".join(window)
            masked = passage.replace(variant, "〈？〉")
            candidates.append({
                "source": {"work": title, "author": author, "file": path.name},
                "category": cat,
                "answerWord": word,
                "matchedVariant": variant,
                "sentence": sent,
                "passage": passage,
                "maskedPassage": masked,
            })
            break  # 1文につき最長マッチ1件
    return candidates


def main():
    lexicon = load_lexicon()
    all_cands = []
    for arg in sys.argv[1:]:
        p = Path(arg)
        cands = extract(p, lexicon)
        t, a, _ = read_aozora(p)
        print(f"{a} 『{t}』: {len(cands)} 件")
        all_cands.extend(cands)

    out = ROOT / "data" / "candidates.json"
    out.write_text(json.dumps(all_cands, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n合計 {len(all_cands)} 件 → {out}")

    # レビュー用 markdown(各作品から最大5件)
    preview = ROOT / "data" / "candidates_preview.md"
    lines = ["# 抽出候補プレビュー\n"]
    by_work = {}
    for c in all_cands:
        by_work.setdefault(c["source"]["work"], []).append(c)
    for work, cs in by_work.items():
        lines.append(f"\n## {cs[0]['source']['author']}『{work}』({len(cs)}件)\n")
        for c in cs[:5]:
            lines.append(f"**[{c['category']}] 正解: {c['answerWord']}**(マッチ: {c['matchedVariant']})\n")
            lines.append(f"> {c['maskedPassage']}\n")
    preview.write_text("\n".join(lines), encoding="utf-8")
    print(f"プレビュー → {preview}")


if __name__ == "__main__":
    main()
