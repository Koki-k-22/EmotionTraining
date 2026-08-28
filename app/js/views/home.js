import { getDueQuestionIds, getStreak } from "../store.js";

function bundledCount(questions) {
  // ノックは (回答文×型) に展開されているので、回答文の本数で数える
  const knockBases = new Set(questions.filter((q) => q.kind === "knock").map((q) => q.baseId));
  return questions.filter((q) => q.kind !== "knock").length + knockBases.size;
}

export function renderHome({ questions, onStartAL, onStartPractice, onStartReading, onStartFollowup, onStartKnock, navigate }) {
  const root = document.createElement("section");
  root.className = "screen stack";
  const streak = getStreak();
  const questionIds = new Set(questions.map((q) => q.id));
  const reviewCount = getDueQuestionIds().filter((id) => questionIds.has(id)).length;

  root.innerHTML = `
    <p class="eyebrow">Active Listening 練習</p>
    <h1>言葉の裏の気持ちを、言葉にして返す</h1>
    <div class="home-metrics">
      <div class="metric"><span>連続</span><strong>${streak.days}</strong><small>日</small></div>
      <div class="metric"><span>復習</span><strong>${reviewCount}</strong><small>問</small></div>
      <div class="metric"><span>同梱</span><strong>${bundledCount(questions)}</strong><small>問</small></div>
    </div>
    <button class="primary-btn" type="button" data-action="al">練習をはじめる（Active Listening）</button>
    <div class="button-row">
      <button class="secondary-btn" type="button" data-action="knock">100本ノック（質問を作る）</button>
      <button class="secondary-btn" type="button" data-action="knock10">10本だけ</button>
    </div>
    <button class="secondary-btn" type="button" data-action="followup">質問ドリル（深掘り質問の型）</button>
    <button class="secondary-btn" type="button" data-action="practice">基礎練習（感情語）</button>
    <button class="secondary-btn" type="button" data-action="reading">読解モード（小説）</button>
    <button class="secondary-btn" type="button" data-action="review">復習する</button>
  `;

  root.querySelector("[data-action='al']").addEventListener("click", onStartAL);
  root.querySelector("[data-action='knock']").addEventListener("click", () => onStartKnock(100));
  root.querySelector("[data-action='knock10']").addEventListener("click", () => onStartKnock(10));
  root.querySelector("[data-action='followup']").addEventListener("click", onStartFollowup);
  root.querySelector("[data-action='practice']").addEventListener("click", onStartPractice);
  root.querySelector("[data-action='reading']").addEventListener("click", onStartReading);
  root.querySelector("[data-action='review']").addEventListener("click", () => navigate("review"));
  return root;
}
