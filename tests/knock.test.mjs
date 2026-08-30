import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { KNOCK_TYPE_ORDER, buildKnockSessionIds, expandKnock } from "../app/js/knock.js";
import { gradeKnock, isKnockQuestion } from "../app/js/grading.js";

const masterPath = new URL("../data/questions_knock_v1.json", import.meta.url);
const appPath = new URL("../app/data/questions_knock_v1.json", import.meta.url);
const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
const items = expandKnock(master);

function seededRandom(seed = 1) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

test("knock データ: 5話題×10ペルソナ=50本、各回答文に8型の模範がある", () => {
  assert.equal(master.items.length, 50);
  assert.equal(Object.keys(master.topics).length, 5);
  assert.equal(Object.keys(master.personas).length, 10);
  for (const item of master.items) {
    assert.deepEqual(Object.keys(item.questions).sort(), [...KNOCK_TYPE_ORDER].sort(), item.id);
    assert.ok(master.topics[item.topic], `${item.id}: topic`);
    assert.ok(master.personas[item.persona], `${item.id}: persona`);
    const phrases = new Set();
    for (const key of KNOCK_TYPE_ORDER) {
      assert.equal(item.questions[key].length, 3, `${item.id}/${key}: 3 variants`);
      for (const variant of item.questions[key]) {
        assert.ok(variant.phrase.trim(), `${item.id}/${key}: phrase`);
        assert.ok(variant.why.trim(), `${item.id}/${key}: why`);
        assert.ok(!phrases.has(variant.phrase), `${item.id}: dup ${variant.phrase}`);
        phrases.add(variant.phrase);
      }
    }
  }
  const perTopic = {};
  for (const item of master.items) perTopic[item.topic] = (perTopic[item.topic] ?? 0) + 1;
  assert.deepEqual(perTopic, { a: 10, b: 10, c: 10, d: 10, e: 10 });
});

test("knock データ: app/data の同梱コピーがマスターと一致する", () => {
  assert.equal(fs.readFileSync(appPath, "utf8"), fs.readFileSync(masterPath, "utf8"));
});

test("expandKnock: 400問に展開され id が一意、kind/category が付く", () => {
  assert.equal(items.length, 400);
  assert.equal(new Set(items.map((q) => q.id)).size, 400);
  const first = items[0];
  assert.equal(first.id, "kn_a01_1a");
  assert.equal(first.kind, "knock");
  assert.equal(first.category, "具体化");
  assert.equal(first.topicLabel, "最近ハマっていること");
  assert.equal(first.persona.name, "田中 美咲");
  assert.equal(first.models.length, 3);
  assert.equal(first.models[0].phrase, master.items[0].questions["1a"][0].phrase);
  assert.equal(first.allQuestions["7"].length, 3);
  assert.ok(isKnockQuestion(first));
});

test("buildKnockSessionIds: 100問、各回答文につき2問、同じ(回答文,型)は重複しない", () => {
  const ids = buildKnockSessionIds(items, 100, {}, seededRandom(7));
  assert.equal(ids.length, 100);
  assert.equal(new Set(ids).size, 100);
  const perBase = {};
  for (const id of ids) {
    const base = id.slice(0, id.lastIndexOf("_"));
    perBase[base] = (perBase[base] ?? 0) + 1;
  }
  assert.ok(Object.values(perBase).every((n) => n === 2));
  // 1周目(50問)の中で同じ回答文は出ない
  const firstPass = ids.slice(0, 50).map((id) => id.slice(0, id.lastIndexOf("_")));
  assert.equal(new Set(firstPass).size, 50);
});

test("buildKnockSessionIds: 未回答の型を優先する", () => {
  const records = {};
  for (const q of items) {
    if (q.type !== "7") records[q.id] = { attempts: [{ ts: 1, input: "x", result: "best" }] };
  }
  const ids = buildKnockSessionIds(items, 50, records, seededRandom(3));
  assert.equal(ids.length, 50);
  assert.ok(ids.every((id) => id.endsWith("_7")));
});

test("buildKnockSessionIds: 10問でも組める", () => {
  const ids = buildKnockSessionIds(items, 10, {}, seededRandom(1));
  assert.equal(ids.length, 10);
  assert.equal(new Set(ids.map((id) => id.slice(0, id.lastIndexOf("_")))).size, 10);
});

test("gradeKnock: 自動採点せず常に unknown(自己採点)を返す", () => {
  assert.deepEqual(gradeKnock(), { result: "unknown", matched: null });
  assert.deepEqual(gradeKnock("それで、どうなったんですか？"), { result: "unknown", matched: null });
});
