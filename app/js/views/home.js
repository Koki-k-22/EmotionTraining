import { getReviewCount, getStreak } from "../store.js";

export function renderHome({ questions, onStartPractice, navigate }) {
  const root = document.createElement("section");
  root.className = "screen stack";
  const streak = getStreak();
  const reviewCount = getReviewCount();

  root.innerHTML = `
    <p class="eyebrow">感情ラベリング練習</p>
    <h1>場面から、いちばん近い感情語を選ぶ</h1>
    <div class="home-metrics">
      <div class="metric"><span>連続</span><strong>${streak.days}</strong><small>日</small></div>
      <div class="metric"><span>復習</span><strong>${reviewCount}</strong><small>問</small></div>
      <div class="metric"><span>同梱</span><strong>${questions.length}</strong><small>問</small></div>
    </div>
    <button class="primary-btn" type="button">練習をはじめる</button>
    <button class="secondary-btn" type="button">復習する</button>
  `;

  root.querySelector(".primary-btn").addEventListener("click", onStartPractice);
  root.querySelector(".secondary-btn").addEventListener("click", () => navigate("review"));
  return root;
}
