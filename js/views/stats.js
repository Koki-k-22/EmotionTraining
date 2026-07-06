import { getStats } from "../store.js";

const CATEGORY_ORDER = ["喜", "怒", "哀", "怖", "恥", "好", "厭", "昂", "安", "驚"];

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

export function renderStats({ questions }) {
  const stats = getStats(questions);
  const root = document.createElement("section");
  root.className = "screen stack";
  root.innerHTML = `
    <p class="eyebrow">成績</p>
    <h1>練習の記録</h1>
    <div class="home-metrics">
      <div class="metric"><span>総回答</span><strong>${stats.total}</strong><small>回</small></div>
      <div class="metric"><span>◎率</span><strong>${percent(stats.bestRate)}</strong><small></small></div>
      <div class="metric"><span>連続</span><strong>${stats.streak.days}</strong><small>日</small></div>
    </div>
  `;

  const bars = document.createElement("div");
  bars.className = "bars";
  for (const category of CATEGORY_ORDER) {
    const item = stats.byCategory[category] ?? { total: 0, best: 0 };
    const rate = item.total ? item.best / item.total : 0;
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${category}</span>
      <div class="bar"><i style="width:${Math.round(rate * 100)}%"></i></div>
      <strong>${item.total ? percent(rate) : "-"}</strong>
    `;
    bars.append(row);
  }
  root.append(bars);
  return root;
}
