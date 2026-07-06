import { gradeAnswer } from "../grading.js";
import { getRecords, recordAttempt } from "../store.js";

const RESULT_LABELS = {
  best: "◎",
  ok: "○",
  poor: "△",
  miss: "×",
  unknown: "?",
};

const RESULT_TEXT = {
  best: "ぴったり",
  ok: "近い",
  poor: "少しズレ",
  miss: "もう一度",
  unknown: "自己採点",
};

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(options)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    node.append(child);
  }
  return node;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function createPracticeSession(questions, count = 10) {
  const records = getRecords();
  const untried = questions.filter((q) => !records[q.id]?.attempts?.length);
  const pool = untried.length ? untried : questions;
  return {
    kind: "practice",
    ids: shuffle(pool).slice(0, Math.min(count, pool.length)).map((q) => q.id),
    index: 0,
    phase: "question",
    input: "",
    autoGrade: null,
    finalResult: null,
    summary: { best: 0, ok: 0, poor: 0, miss: 0 },
  };
}

export function createReviewSession(questions, ids) {
  const validIds = ids.filter((id) => questions.some((q) => q.id === id));
  return {
    kind: "review",
    ids: shuffle(validIds),
    index: 0,
    phase: "question",
    input: "",
    autoGrade: null,
    finalResult: null,
    summary: { best: 0, ok: 0, poor: 0, miss: 0 },
  };
}

function revealPassage(q) {
  const answer = `<mark>${q.answer.surface || q.answer.word}</mark>`;
  return q.passage ? q.passage.replace("〈？〉", answer) : q.context ?? "";
}

function wordList(title, mark, items) {
  const block = el("section", { class: "answer-group" });
  block.append(el("h3", { text: `${mark} ${title}` }));
  const list = el("ul", { class: "clean-list" });
  for (const item of items) {
    list.append(el("li", {}, [
      el("strong", { text: item.word }),
      el("span", { text: item.why ? ` ${item.why}` : "" }),
    ]));
  }
  block.append(list);
  return block;
}

function cuesList(q) {
  const block = el("section", { class: "answer-group" });
  block.append(el("h3", { text: "手がかり" }));
  const list = el("ul", { class: "clean-list" });
  for (const cue of q.cues ?? []) {
    list.append(el("li", { text: cue }));
  }
  block.append(list);
  return block;
}

function renderSummary(session, callbacks) {
  const root = el("section", { class: "screen stack" });
  root.append(el("p", { class: "eyebrow", text: session.kind === "review" ? "復習完了" : "練習完了" }));
  root.append(el("h1", { text: "結果サマリ" }));
  const grid = el("div", { class: "summary-grid" });
  for (const key of ["best", "ok", "poor", "miss"]) {
    grid.append(el("div", { class: "metric" }, [
      el("span", { text: RESULT_LABELS[key] }),
      el("strong", { text: String(session.summary[key] ?? 0) }),
      el("small", { text: RESULT_TEXT[key] }),
    ]));
  }
  root.append(grid);
  root.append(el("button", { class: "primary-btn", type: "button", text: "ホームへ戻る" }));
  root.querySelector("button").addEventListener("click", callbacks.finish);
  return root;
}

function renderQuestion(q, session, callbacks) {
  const root = el("section", { class: "screen stack" });
  root.append(el("p", { class: "eyebrow", text: `${session.index + 1} / ${session.ids.length}` }));
  root.append(el("h1", { text: session.kind === "review" ? "復習" : "小説モード" }));
  root.append(el("p", { class: "source", text: `${q.source.author}『${q.source.work}』` }));
  root.append(el("article", { class: "passage", text: q.passage ?? q.context ?? "" }));

  const form = el("form", { class: "answer-form" });
  const label = el("label", { class: "field-label", for: "answer-input", text: "この人物の感情を表す一言を" });
  const input = el("input", {
    id: "answer-input",
    name: "answer",
    autocomplete: "off",
    placeholder: "例: それは悔しいですね",
    value: session.input,
  });
  const actions = el("div", { class: "button-row" }, [
    el("button", { class: "primary-btn", type: "submit", text: "答え合わせ" }),
    el("button", { class: "secondary-btn", type: "button", text: "わからない" }),
  ]);
  form.append(label, input, actions);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    callbacks.submit(input.value);
  });
  actions.querySelector(".secondary-btn").addEventListener("click", () => callbacks.skip());
  root.append(form);
  return root;
}

function renderAnswer(q, session, callbacks) {
  const root = el("section", { class: "screen stack" });
  const result = session.finalResult ?? session.autoGrade?.result ?? "unknown";
  const badge = el("div", { class: `result-badge result-${result}` }, [
    el("span", { text: RESULT_LABELS[result] }),
    el("strong", { text: RESULT_TEXT[result] }),
  ]);
  root.append(badge);

  if (session.autoGrade?.result === "unknown" && !session.finalResult) {
    root.append(el("p", { class: "hint", text: "自動照合できませんでした。答えを見て自己採点してください。" }));
    const self = el("div", { class: "button-row three" }, [
      el("button", { class: "primary-btn", type: "button", text: "◎" }),
      el("button", { class: "secondary-btn", type: "button", text: "○" }),
      el("button", { class: "secondary-btn", type: "button", text: "×" }),
    ]);
    self.children[0].addEventListener("click", () => callbacks.selfGrade("best"));
    self.children[1].addEventListener("click", () => callbacks.selfGrade("ok"));
    self.children[2].addEventListener("click", () => callbacks.selfGrade("miss"));
    root.append(self);
  }

  root.append(el("p", { class: "source", text: `${q.source.author}『${q.source.work}』` }));
  root.append(el("article", { class: "passage", html: revealPassage(q) }));
  root.append(wordList("ベスト", "◎", [{ word: q.answer.word }]));
  root.append(wordList("許容", "○", q.ok ?? []));
  root.append(wordList("ズレ", "△", q.poor ?? []));
  root.append(cuesList(q));
  root.append(el("section", { class: "answer-group" }, [
    el("h3", { text: "解説" }),
    el("p", { text: q.explanation }),
  ]));

  const next = el("button", {
    class: "primary-btn",
    type: "button",
    text: session.index + 1 >= session.ids.length ? "結果を見る" : "次へ",
  });
  next.disabled = session.autoGrade?.result === "unknown" && !session.finalResult;
  next.addEventListener("click", callbacks.next);
  root.append(next);
  return root;
}

export function renderPracticeSession({ questions, session, onUpdate, onFinish }) {
  if (!session || session.ids.length === 0) {
    const root = el("section", { class: "screen stack" });
    root.append(el("h1", { text: "出題できる問題がありません" }));
    return root;
  }

  if (session.phase === "summary") {
    return renderSummary(session, { finish: onFinish });
  }

  const q = questions.find((item) => item.id === session.ids[session.index]);
  if (!q) {
    const next = { ...session, phase: "summary" };
    queueMicrotask(() => onUpdate(next));
    return el("section", { class: "screen stack" }, [el("h1", { text: "問題を確認しています" })]);
  }

  const callbacks = {
    submit(input) {
      const autoGrade = gradeAnswer(input, q);
      const next = { ...session, input, autoGrade, finalResult: null, phase: "answer" };
      if (autoGrade.result !== "unknown") {
        recordAttempt(q.id, input, autoGrade.result);
        next.finalResult = autoGrade.result;
        next.summary = {
          ...next.summary,
          [autoGrade.result]: (next.summary[autoGrade.result] ?? 0) + 1,
        };
      }
      onUpdate(next);
    },
    skip() {
      onUpdate({ ...session, input: "わからない", autoGrade: { result: "unknown", matched: null }, finalResult: null, phase: "answer" });
    },
    selfGrade(result) {
      recordAttempt(q.id, session.input, result);
      onUpdate({
        ...session,
        finalResult: result,
        summary: { ...session.summary, [result]: (session.summary[result] ?? 0) + 1 },
      });
    },
    next() {
      const done = session.index + 1 >= session.ids.length;
      onUpdate({
        ...session,
        index: done ? session.index : session.index + 1,
        phase: done ? "summary" : "question",
        input: "",
        autoGrade: null,
        finalResult: null,
      });
    },
  };

  if (session.phase === "answer") {
    return renderAnswer(q, session, callbacks);
  }

  return renderQuestion(q, session, callbacks);
}
