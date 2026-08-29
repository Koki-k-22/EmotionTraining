import { KNOCK_CHECKLIST, KNOCK_TYPES, KNOCK_TYPE_ORDER } from "../knock.js";

const RESULT_LABELS = { best: "◎", ok: "○", miss: "×" };
const RESULT_TEXT = { best: "型どおり", ok: "惜しい", miss: "ズレた" };

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

// フラッシュカード形式: 質問は頭の中で作り（入力しない）、「答えを見る」で模範を開いて自己採点する
export function renderKnockQuestion(q, session, callbacks) {
  const root = el("section", { class: "screen stack" });
  root.append(el("p", { class: "eyebrow", text: `${session.index + 1} / ${session.ids.length}` }));
  root.append(el("h1", { text: sessionTitle(session) }));
  root.append(renderScene(q));
  root.append(renderTypeCard(q, { withAnchor: true }));
  root.append(el("p", { class: "field-label", text: "この回答に対して、上の型で質問するなら？ 頭の中で（できれば声に出して）作ってから、答えを見る" }));

  const reveal = el("button", { class: "primary-btn", type: "button", text: "答えを見る" });
  reveal.addEventListener("click", () => callbacks.submit(""));
  root.append(reveal);
  return root;
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
    check.append(el("p", { class: "hint", text: "◎ 型どおりの質問が自然に出た / ○ 型は合うが硬い・迷った / × 別の型になった・出てこなかった" }));
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
