import { getDueQuestionIds } from "../store.js";
import { createReviewSession, renderPracticeSession } from "./practice.js";

export function renderReview({ questions, session, onUpdate, onFinish }) {
  const dueIds = getDueQuestionIds();

  if (!session) {
    const root = document.createElement("section");
    root.className = "screen stack";
    root.innerHTML = `
      <p class="eyebrow">復習</p>
      <h1>${dueIds.length ? "復習キューがあります" : "今の復習はありません"}</h1>
      <p class="hint">${dueIds.length ? `${dueIds.length}問を出題します。` : "練習で記録すると、復習タイミングの問題がここに出ます。"}</p>
      <button class="primary-btn" type="button" ${dueIds.length ? "" : "disabled"}>復習をはじめる</button>
    `;
    root.querySelector("button").addEventListener("click", () => onUpdate(createReviewSession(questions, dueIds)));
    return root;
  }

  return renderPracticeSession({ questions, session, onUpdate, onFinish });
}
