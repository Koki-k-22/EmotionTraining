# 小説モード問題 監修要件定義 v1

作成: 2026-07-02 / 要件定義: Fable、監修実施: Sonnet(バッチ並列)

## 目的

`data/candidates.json` の抽出候補(青空文庫由来・187件)を審査し、
アプリに収録できる「選び分け」問題に仕上げる。

## 入力

各候補は以下のフィールドを持つ:
`id, category(10分類), answerWord(正解の感情語), matchedVariant(本文中の表記),
passage(原文), maskedPassage(感情語を〈？〉にマスクした出題文), source(作品・作者)`

## 審査基準(5項目すべて満たしたものだけ accept)

1. **感情性**: matchedVariant がその文脈で登場人物(または語り手)自身の感情を
   表している。慣用的用法・物理的用法(例:「家に落ちついている」)・
   一般論としての言及は reject。 → rejectReason: `not_emotion`
2. **推測可能性**: maskedPassage **だけ**を読んで感情の系統が推測でき、
   answerWord がベスト候補として腑に落ちる。文脈が足りない・
   どの感情でも通ってしまうものは reject。 → `not_inferable`
3. **自己完結性**: 作品を読んでいなくても場面が理解できる。
   人名は出てよいが、関係性が不明で場面の意味が取れないものは reject。
   → `not_self_contained`
4. **可読性**: 現代の読者が注釈なしで通読できる。旧仮名・難読語が
   密集して読みにくいものは reject。 → `hard_to_read`
5. **ヒント漏れ**: passage 内に answerWord とほぼ同義の感情語が露出して
   答えが即バレするもの。追加マスクで救済できるなら `additionalMask` に
   その語を指定して accept、できないなら reject。 → `hint_leak`

迷ったら reject(収録数より品質を優先する)。

## 仕上げ(accept した候補のみ)

- `grade`: **A** = そのまま良問 / **B** = 使えるが次点
- `ok`: 1〜2 語。間違いではないが精度が一歩落ちる感情語 + `why`(どこが浅い/ズレるか)
- `poor`: 1〜2 語。ありがちな外し方 + `why`(なぜ外れるか)
- `cues`: 1〜3 個。「本文の表現 → 読み取れること」の形式
- `explanation`: answerWord がベストである理由(2〜3 文)
- `additionalMask`: 追加でマスクすべき語(基準 5 の救済時のみ)

制約:
- ok / poor には answerWord の活用違い・表記違いを使わない
- ok / poor は現代語で、実際に人が口にしそうな感情語にする
- ok と poor は「系統は近いが精度が違う」勾配になるよう選ぶ
  (例: 正解「悔しい」/ ok「腹立たしい」/ poor「悲しい」)

## 出力形式

JSON 配列。**入力された全 id について 1 要素ずつ**、以下の形で出力する:

```json
{
  "id": "c012",
  "verdict": "accept",
  "grade": "A",
  "ok": [{ "word": "…", "why": "…" }],
  "poor": [{ "word": "…", "why": "…" }],
  "cues": ["「…」→ …"],
  "explanation": "…",
  "additionalMask": null
}
```

reject の場合は `{ "id": "…", "verdict": "reject", "rejectReason": "…" }` のみでよい。

## 収録セットの確定(監修後、Fable が実施)

- accept かつ grade A を優先し、B で補完
- カテゴリの偏りを緩和(1 カテゴリ最大 12 問)
- 1 作品からの採用上限 15 問(『女生徒』の独占を防ぐ)
- 目標 50 問前後 → `data/questions_novel_v1.json`
- 確定前に無作為抽出でスポットチェック(下位モデル監修の検品)
