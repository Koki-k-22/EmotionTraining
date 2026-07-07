import { getDueQuestionIds, getStreak } from "../store.js";

export function renderHome({ questions, onStartPractice, onStartReading, navigate }) {
  const root = document.createElement("section");
  root.className = "screen stack";
  const streak = getStreak();
  const questionIds = new Set(questions.map((q) => q.id));
  const reviewCount = getDueQuestionIds().filter((id) => questionIds.has(id)).length;

  root.innerHTML = `
    <p class="eyebrow">感情ラベリング練習</p>
    <h1>場面から、いちばん近い感情語を選ぶ</h1>
    <div class="home-metrics">
      <div class="metric"><span>連続</span><strong>${streak.days}</strong><small>日</small></div>
      <div class="metric"><span>復習</span><strong>${reviewCount}</strong><small>問</small></div>
      <div class="metric"><span>同梱</span><strong>${questions.length}</strong><small>問</small></div>
    </div>
    <button class="primary-btn" type="button" data-action="practice">練習をはじめる</button>
    <button class="secondary-btn" type="button" data-action="reading">読解モード（小説）</button>
    <button class="secondary-btn" type="button" data-action="review">復習する</button>
  `;

  root.querySelector("[data-action='practice']").addEventListener("click", onStartPractice);
  root.querySelector("[data-action='reading']").addEventListener("click", onStartReading);
  root.querySelector("[data-action='review']").addEventListener("click", () => navigate("review"));
  return root;
}
