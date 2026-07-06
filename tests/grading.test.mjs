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
