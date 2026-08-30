import { KNOCK_TYPES, KNOCK_TYPE_ORDER } from "../knock.js";

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

// フラッシュカード形式: 質問は頭の中で作り（入力しない）、「答えを見る」→模範3例→「次へ」でテンポよく回す
export function renderKnockQuestion(q, session, callbacks) {
  const root = el("section", { class: "screen stack" });
  root.append(el("p", { class: "eyebrow", text: `${session.index + 1} / ${session.ids.length}` }));
  root.append(el("h1", { text: session.kind === "review" ? "復習" : "100本ノック" }));
  root.append(renderScene(q));
  root.append(renderTypeCard(q, { withAnchor: true }));
  root.append(el("p", { class: "field-label", text: "この型で質問するなら？ 頭の中で（できれば声に出して）作ってから、答えを見る" }));

  const reveal = el("button", { class: "primary-btn", type: "button", text: "答えを見る" });
  reveal.addEventListener("click", () => callbacks.submit(""));
  root.append(reveal);
  return root;
}

export function renderKnockAnswer(q, session, callbacks) {
  const root = el("section", { class: "screen stack" });
  root.append(el("p", { class: "eyebrow", text: `${session.index + 1} / ${session.ids.length}` }));
  root.append(el("h1", { text: "模範解答（3例）" }));

  root.append(renderScene(q));
  root.append(renderTypeCard(q));

  const model = el("section", { class: "answer-group" });
  const list = el("ol", { class: "model-answers" });
  for (const item of q.models ?? []) {
    const li = el("li", {});
    li.append(el("p", { class: "model-reply", text: `「${item.phrase}」` }));
    if (item.why) li.append(el("p", { class: "hint model-why", text: item.why }));
    list.append(li);
  }
  model.append(list);
  model.append(el("p", { class: "hint", text: "どれかと同じ狙いの質問が出ていればOK。別の切り口でも、型が合っていればOK。" }));
  root.append(model);

  const others = el("details", { class: "accordion" });
  others.append(el("summary", { text: "他の型だと、どう聞く？" }));
  const otherList = el("ul", { class: "model-list" });
  for (const key of KNOCK_TYPE_ORDER) {
    if (key === q.type || !q.allQuestions?.[key]?.length) continue;
    const type = KNOCK_TYPES[key];
    otherList.append(el("li", {}, [
      el("b", { text: `${type.num} ${type.label}` }),
      el("span", { text: ` 「${q.allQuestions[key][0].phrase}」` }),
    ]));
  }
  others.append(otherList);
  root.append(others);

  const next = el("button", {
    class: "primary-btn",
    type: "button",
    text: session.index + 1 >= session.ids.length ? "結果を見る" : "次へ",
  });
  next.addEventListener("click", callbacks.next);
  root.append(next);
  return root;
}
