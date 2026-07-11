import test from "node:test";
import assert from "node:assert/strict";

import { gradeAnswer, normalizeText } from "../app/js/grading.js";

const question = {
  answer: { word: "悔しい", surface: "くやし" },
  ok: [{ word: "無念", why: "" }],
  poor: [{ word: "悲しい", why: "" }],
};

test("◎語を含む一言を best と判定する", () => {
  assert.equal(gradeAnswer("それは悔しいですね", question).result, "best");
});

test("○語を含む一言を ok と判定する", () => {
  assert.equal(gradeAnswer("本当に無念だったと思います", question).result, "ok");
});

test("表記ゆれとして全角半角と空白を正規化する", () => {
  assert.equal(normalizeText(" Ａ B　くやし い "), "ABくやしい");
  assert.equal(gradeAnswer("それは　くやし　かったですね", question).result, "best");
});

test("不一致は unknown を返す", () => {
  assert.deepEqual(gradeAnswer("今日は眠いですね", question), {
    result: "unknown",
    matched: null,
  });
});

test("difficultyを持つ創作問題でも採点できる", () => {
  const questionWithDifficulty = {
    ...question,
    difficulty: 2,
    source: { work: "創作シナリオ", author: "", origin: "オリジナル" },
  };

  assert.equal(gradeAnswer("悔しい気持ちです", questionWithDifficulty).result, "best");
});

import { gradeAnswerAL, isDeepQuestion } from "../app/js/grading.js";

const alQuestion = {
  surface: { word: "腹立たしい", synonyms: ["ムカつく", "怒り"] },
  deep: {
    best: [
      {
        phrase: "努力ごと軽く扱われたと感じた",
        keys: [["努力", "半月", "準備"], ["軽く", "無駄", "踏みにじ"]],
      },
      {
        phrase: "信頼されていないと感じた",
        keys: [["信頼", "信用"], ["ない", "されず", "もらえ"]],
      },
    ],
    poor: [{ phrase: "課長に嫌われている", why: "" }],
  },
};

test("AL: キーワード群(AND of OR)が揃えば best", () => {
  const graded = gradeAnswerAL("半月も準備したのに軽く扱われた感じがして悔しいよね", alQuestion);
  assert.equal(graded.result, "best");
});

test("AL: 片方のグループだけでは best にならない", () => {
  assert.equal(gradeAnswerAL("努力してたのにね", alQuestion).result, "unknown");
});

test("AL: 表層感情語の言い換えは ok 止まり", () => {
  assert.equal(gradeAnswerAL("それはムカつくよね", alQuestion).result, "ok");
});

test("AL: 2つ目の best 候補でも成立する", () => {
  assert.equal(gradeAnswerAL("信頼されてないって感じたんだね", alQuestion).result, "best");
});

test("AL: 不一致は unknown(自己採点へ)", () => {
  assert.equal(gradeAnswerAL("大変だったね", alQuestion).result, "unknown");
});

test("AL: 空入力は unknown", () => {
  assert.equal(gradeAnswerAL("  ", alQuestion).result, "unknown");
});

test("isDeepQuestion は deep.best の有無で判定する", () => {
  assert.equal(isDeepQuestion(alQuestion), true);
  assert.equal(isDeepQuestion(question), false);
});
