export const FOLLOWUP_TYPES = {
  "1": { num: "①", label: "詳細（具体・背景）", anchor: "具体的には？／きっかけは何だったんですか？" },
  "2": { num: "②", label: "感想・意見", anchor: "〜については、どう思ってますか？" },
  "3": { num: "③", label: "理由・目的", anchor: "決め手は何だったんですか？" },
  "4": { num: "④", label: "結果・影響", anchor: "それで、どうなったんですか？" },
  "5": { num: "⑤", label: "対策・次の一手", anchor: "次は、どうするんですか？" },
  "6": { num: "⑥", label: "比較・対比", anchor: "他のと比べて、どうなんですか？" },
  "7": { num: "⑦", label: "振り返り", anchor: "今振り返ってみて、どうですか？" },
};

const CHOICE_ORDER = ["1", "2", "3", "4", "5", "6", "7"];

const RESULT_LABELS = { best: "◎", ok: "○", miss: "×" };
const RESULT_TEXT = { best: "正解", ok: "惜しい", miss: "もう一度" };

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(options)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    node.append(child);
  }
  return node;
}

function formatDifficulty(q) {
  const level = Number(q.difficulty);
  if (!Number.isInteger(level) || level < 1 || level > 3) return "";
  return `${"★".repeat(level)}${"☆".repeat(3 - level)}`;
}

function sessionTitle(session) {
  return session.kind === "review" ? "復習" : "質問ドリル";
}

function renderScene(q) {
  const scene = el("div", { class: "followup-scene" });
  if (q.utterance) {
    scene.append(el("blockquote", { class: "utterance", text: `「${q.utterance}」` }));
  }
  scene.append(el("p", { class: "followup-phrase", text: `「${q.phrase}」` }));
  return scene;
}

function typeLine(key) {
  const type = FOLLOWUP_TYPES[key];
  if (!type) return el("span", { text: key });
  return el("span", {}, [el("strong", { text: `${type.num} ${type.label}` })]);
}

export function renderFollowupQuestion(q, session, callbacks) {
  const root = el("section", { class: "screen stack" });
  root.append(el("p", { class: "eyebrow", text: `${session.index + 1} / ${session.ids.length}` }));
  root.append(el("h1", { text: sessionTitle(session) }));
  const difficulty = formatDifficulty(q);
  if (difficulty) {
    root.append(el("p", { class: "difficulty", text: difficulty, "aria-label": `難易度 ${difficulty}` }));
  }
  root.append(renderScene(q));
  root.append(el("p", { class: "field-label", text: "この質問は、どの型？" }));

  const grid = el("div", { class: "choice-grid" });
  for (const key of CHOICE_ORDER) {
    const type = FOLLOWUP_TYPES[key];
    const btn = el("button", { class: "choice-btn", type: "button" }, [
      el("b", { text: type.num }),
      el("span", { text: type.label }),
    ]);
    btn.addEventListener("click", () => callbacks.submit(key));
    grid.append(btn);
  }
  root.append(grid);
  return root;
}

export function renderFollowupAnswer(q, session, callbacks) {
  const root = el("section", { class: "screen stack" });
  const result = session.finalResult ?? "miss";
  root.append(el("div", { class: `result-badge result-${result}` }, [
    el("span", { text: RESULT_LABELS[result] ?? "?" }),
    el("strong", { text: RESULT_TEXT[result] ?? "" }),
  ]));

  root.append(renderScene(q));

  const answerBlock = el("section", { class: "answer-group" });
  answerBlock.append(el("h3", { text: "正解の型" }));
  answerBlock.append(el("p", {}, [typeLine(q.answer)]));
  const anchor = FOLLOWUP_TYPES[q.answer]?.anchor;
  if (anchor) {
    answerBlock.append(el("p", { class: "hint", text: `アンカーフレーズ: 「${anchor}」` }));
  }
  root.append(answerBlock);

  if (result !== "best" && session.autoGrade?.matched) {
    root.append(el("section", { class: "answer-group" }, [
      el("h3", { text: "あなたの回答" }),
      el("p", {}, [typeLine(session.autoGrade.matched)]),
    ]));
  }

  root.append(el("section", { class: "answer-group" }, [
    el("h3", { text: "解説" }),
    el("p", { text: q.explanation ?? "" }),
  ]));

  const next = el("button", {
    class: "primary-btn",
    type: "button",
    text: session.index + 1 >= session.ids.length ? "結果を見る" : "次へ",
  });
  next.addEventListener("click", callbacks.next);
  root.append(next);
  return root;
}
