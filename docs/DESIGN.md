# 感情ラベリング練習アプリ 設計書 v1.1

仕様は `SPEC.md` を正とする。v1 は小説モードのみで実装。
v1.1(2026-07-03)で出題を2系統に拡張した:

- **練習(メイン)**: 創作CAR問題 `questions_car_v1.json`(64問、docs/AUTHORING.md 準拠、
  ブラインドテスト全問合格)。difficulty(1〜3)を★表示
- **読解モード**: 青空文庫由来 `questions_novel_v1.json`(ブラインドテスト合格の45問に削減)
- 復習・成績は両モードの記録を questionId ベースで合算
- SW キャッシュは et-v2

## 1. 技術方針

- **PWA / 静的サイト**。ビルド工程なし・フレームワークなし(Vanilla JS, ES Modules)
- サーバー・アカウント・外部送信なし。記録は `localStorage`
- スマホ(iOS Safari / Android Chrome)のブラウザ+ホーム画面追加で動作。
  Service Worker でオフライン動作
- 開発時の動作確認は `python3 -m http.server` などの静的サーバーで行う
  (SW と fetch のため `file://` では動かない)

## 2. ディレクトリ構成

```
app/
  index.html            # 単一ページ。全画面をJSで切替
  manifest.webmanifest
  sw.js                 # キャッシュファースト + バージョン付きキャッシュ名
  icons/icon-192.png, icon-512.png   # 単色背景+絵文字等の簡易アイコンでよい
  css/styles.css
  js/
    app.js              # 起動・画面ルーティング(hashルータ)
    store.js            # localStorage ラッパ(記録・復習キュー・設定)
    grading.js          # 採点ロジック(純関数、UI非依存)
    data.js             # 問題・語彙データのロード
    views/
      home.js           # ホーム
      practice.js       # 練習(出題→入力→答え合わせ)
      review.js         # 復習
      dictionary.js     # 感情語彙図鑑
      stats.js          # 成績
  data/
    questions_novel_v1.json   # リポジトリの data/ からコピーして同梱
    emotion_lexicon.json      # 同上
```

## 3. データ

### 3.1 問題(既存 `data/questions_novel_v1.json`)

```
{ id, sourceCandidate, source: {work, author, origin},
  category,            // 10分類: 喜怒哀怖恥好厭昂安驚
  passage,             // 〈？〉マスク済み出題文
  answer: {word, surface},
  ok:   [{word, why}], // ○
  poor: [{word, why}], // △
  cues: [string], explanation, grade }
```

将来の会話シナリオも同じ形+`context`(状況説明)・`modelReply`(模範応答)を
持つ想定。`passage` があれば小説型、`context` があれば会話型として描画を分岐できる
ようにしておく(v1 では小説型のみ実装)。

### 3.2 記録(`localStorage`、キーは `et.` プレフィクス)

```
et.records = {
  [questionId]: {
    attempts: [{ ts, input, result }],  // result: "best"|"ok"|"poor"|"miss"
    box: 0..3,        // 復習ボックス。正解で+1、外すと0
    nextReview: ts    // box に応じて 0日/1日/3日/7日後
  }
}
et.settings = { theme: "auto" }
et.streak = { lastDay: "YYYY-MM-DD", days: n }
```

## 4. 採点ロジック(`grading.js`)

入力: ユーザーの自由記述 `input`、問題 `q`。

1. 正規化: NFKC、空白除去、ひらがな/カタカナはそのまま(語はほぼ漢字かな交じり)
2. 照合(長い語から順に部分一致):
   - `q.answer.word` または `q.answer.surface` を含む → `best`(◎)
   - `q.ok[].word` のいずれかを含む → `ok`(○)
   - `q.poor[].word` のいずれかを含む → `poor`(△)
3. どれにも一致しない → `unknown` を返し、UI が自己採点(◎/○/×)を求める。
   自己採点の ◎→best, ○→ok, ×→miss として記録

純関数として実装し、`tests/grading.test.mjs`(node --test)で
「◎語を含む一言」「○語」「表記ゆれ(全角/半角・空白)」「不一致」をテストする。

## 5. 画面

共通: 画面下部に固定タブバー(ホーム/練習/復習/図鑑/成績)。
モバイルファースト、最小フォント16px、タップ領域44px以上。
ダーク/ライトは `prefers-color-scheme` に追従。日本語UI。

### 5.1 ホーム
- 今日の連続日数、未消化の復習数バッジ
- 「練習をはじめる」ボタン(未出題からランダム10問のセッション)

### 5.2 練習(コアループ)
1. **出題**: 出典(作者『作品』)、カテゴリは隠す。passage を表示
2. **入力**: 1行テキスト入力「この人物の感情を表す一言を」+「わからない」ボタン
3. **答え合わせ**: 判定結果(◎/○/△/自己採点UI)→
   ◎○△すべての語と why、cues、explanation を開示。マスク箇所は正解語を強調表示
4. 「次へ」で次問。セッション終了時に結果サマリ(◎x ○y △z)

### 5.3 復習
- `nextReview <= now` の問題を練習と同じUIで出題。correct で box+1

### 5.4 感情語彙図鑑
- `emotion_lexicon.json` を10分類のアコーディオンで一覧
- 各語タップで variants を表示(v1 は説明文なしでよい)

### 5.5 成績
- 総回答数、◎率、カテゴリ別の◎率(10分類の棒表示)、連続日数

## 6. Service Worker

- インストール時に app シェル+データ JSON をプリキャッシュ
- キャッシュ名 `et-v1` 等バージョン付き。activate で旧キャッシュ削除
- fetch はキャッシュファースト(完全オフライン優先。更新はキャッシュ名の繰上げで)

## 7. 受け入れ基準

- [ ] `python3 -m http.server` で起動し、スマホ幅(375px)で全画面が操作できる
- [ ] 50問の出題→入力→答え合わせ→記録が一巡する
- [ ] 「悔しい」を含む一言で ◎、ok 語で ○、無関係語で自己採点UIが出る
- [ ] リロード後も記録・復習キュー・連続日数が残る
- [ ] オフライン(SW キャッシュ後にネットワーク遮断)で練習できる
- [ ] `node --test tests/` が通る

## 8. v1 でやらないこと

- 会話シナリオモード(データ形だけ互換に)/ プライベートパックの読込 /
  図鑑の語彙説明文 / アニメーション類 / アカウント・同期
