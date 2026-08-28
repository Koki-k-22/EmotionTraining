import { KNOCK_CHECKLIST, KNOCK_TYPES, KNOCK_TYPE_ORDER } from "../knock.js";

const RESULT_LABELS = { best: "◎", ok: "○", miss: "×" };
const RESULT_TEXT = { best: "型どおり", ok: "惜しい", miss: "ズレた" };
const SKIP_INPUT = "わからない";

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

function sessionTitle(session) {
  return session.kind === "review" ? "復習" : "100本ノック";
}

function typeLine(key) {
  const type = KNOCK_TYPES[key];
  if (!type) return el("span", { text: key });
  return el("span", {}, [el("strong", { text: `${type.num} ${type.label}` })]);
}

function renderScene(q) {
  const scene = el("div", { class: "knock-scene" });
  scene.append(el("p", { class: "topic-chip", text: `話題: ${q.topicLabel}` }));
  scene.append(el("p", { class: "persona-line", text: `${q.persona?.name ?? ""}（${q.persona?.profile ?? ""}）` }));
  scene.append(el("blockquote", { class: "utterance knock-answer", text: q.answer }));
  return scene;
}

function renderTypeCard(q, { withAnchor = false } = {}) {
  const type = KNOCK_TYPES[q.type];
  const card = el("section", { class: "type-card" });
  card.append(el("p", { class: "field-label", text: "この型で質問する" }));
  card.append(el("p", { class: "type-name" }, [typeLine(q.type)]));
  if (type?.hint) card.append(el("p", { class: "hint", text: type.hint }));
  if (withAnchor && type?.anchor) {
    const details = el("details", { class: "accordion" });
    details.append(el("summary", { text: "アンカーフレーズを見る" }));
    details.append(el("p", { class: "hint", text: `「${type.anchor}」` }));
    card.append(details);
  }
  return card;
}

export function renderKnockQuestion(q, session, callbacks) {
  const root = el("section", { class: "screen stack" });
  root.append(el("p", { class: "eyebrow", text: `${session.index + 1} / ${session.ids.length}` }));
  root.append(el("h1", { text: sessionTitle(session) }));
  root.append(renderScene(q));
  root.append(renderTypeCard(q, { withAnchor: true }));

  const form = el("form", { class: "answer-form" });
  const label = el("label", {
    class: "field-label",
    for: "answer-input",
    text: "この回答に対して、上の型で質問を作るなら？",
  });
  const input = el("textarea", {
    id: "answer-input",
    name: "answer",
    rows: "3",
    autocomplete: "off",
    placeholder: "例: きっかけは何だったんですか？",
  });
  input.value = session.input;
  const actions = el("div", { class: "button-row" }, [
    el("button", { class: "primary-btn", type: "submit", text: "模範と比べる" }),
    el("button", { class: "secondary-btn", type: "button", text: "わからない" }),
  ]);
  form.append(label, input, actions);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!input.value.trim()) {
      input.focus();
      return;
    }
    callbacks.submit(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  actions.querySelector(".secondary-btn").addEventListener("click", () => callbacks.skip());
  root.append(form);
  return root;
}

function detectionHint(q, session) {
  if (!session.input || session.input === SKIP_INPUT) return null;
  const detected = Array.isArray(session.autoGrade?.matched) ? session.autoGrade.matched : [];
  if (detected.includes(q.type)) {
    const others = detected.filter((key) => key !== q.type);
    return others.length
      ? `キーワードからは指定の型の要素が入っていそうです（${others.map((k) => KNOCK_TYPES[k]?.short ?? k).join("・")}の要素も混ざっています）。`
      : "キーワードからは、指定の型の要素が入っていそうです。";
  }
  if (detected.length) {
    return `キーワードからは「${detected.map((k) => KNOCK_TYPES[k]?.short ?? k).join("・")}」の型に見えます。指定の型とズレていないか、模範と見比べてください。`;
  }
  return "キーワードでは型を判定できませんでした。模範と見比べて自己採点してください。";
}

export function renderKnockAnswer(q, session, callbacks) {
  const root = el("section", { class: "screen stack" });
  const graded = Boolean(session.finalResult);

  if (graded) {
    const result = session.finalResult;
    root.append(el("div", { class: `result-badge result-${result}` }, [
      el("span", { text: RESULT_LABELS[result] ?? "?" }),
      el("strong", { text: RESULT_TEXT[result] ?? "" }),
    ]));
  } else {
    root.append(el("p", { class: "eyebrow", text: `${session.index + 1} / ${session.ids.length}` }));
    root.append(el("h1", { text: "模範と比べて自己採点" }));
  }

  root.append(renderScene(q));
  root.append(renderTypeCard(q));

  const yours = el("section", { class: "answer-group" });
  yours.append(el("h3", { text: "あなたの質問" }));
  if (session.input && session.input !== SKIP_INPUT) {
    yours.append(el("p", { class: "followup-phrase", text: `「${session.input}」` }));
  } else {
    yours.append(el("p", { class: "hint", text: "（今回はスキップ）" }));
  }
  const hint = detectionHint(q, session);
  if (hint) yours.append(el("p", { class: "hint", text: hint }));
  root.append(yours);

  const model = el("section", { class: "answer-group" });
  model.append(el("h3", { text: "模範解答（一例）" }));
  model.append(el("p", { class: "model-reply", text: `「${q.model?.phrase ?? ""}」` }));
  if (q.model?.why) model.append(el("p", { class: "hint", text: q.model.why }));
  root.append(model);

  if (!graded) {
    const check = el("section", { class: "answer-group self-check" });
    check.append(el("h3", { text: "自己採点の観点" }));
    const list = el("ul", { class: "clean-list" });
    for (const item of KNOCK_CHECKLIST) list.append(el("li", { text: item }));
    check.append(list);
    check.append(el("p", { class: "hint", text: "◎ 型どおりで自然 / ○ 型は合うが言い方が硬い・ズレ気味 / × 別の型になっている" }));
    root.append(check);

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

  const others = el("details", { class: "accordion" });
  others.append(el("summary", { text: "他の型だと、どう聞く？" }));
  const list = el("ul", { class: "model-list" });
  for (const key of KNOCK_TYPE_ORDER) {
    if (key === q.type || !q.models?.[key]) continue;
    const type = KNOCK_TYPES[key];
    list.append(el("li", {}, [
      el("b", { text: `${type.num} ${type.label}` }),
      el("span", { text: ` 「${q.models[key].phrase}」` }),
    ]));
  }
  others.append(list);
  root.append(others);

  const next = el("button", {
    class: "primary-btn",
    type: "button",
    text: session.index + 1 >= session.ids.length ? "結果を見る" : "次へ",
  });
  next.disabled = !graded;
  next.addEventListener("click", callbacks.next);
  root.append(next);
  return root;
}
