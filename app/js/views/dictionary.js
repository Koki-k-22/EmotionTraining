export function renderDictionary({ lexicon }) {
  const root = document.createElement("section");
  root.className = "screen stack";
  root.innerHTML = `
    <p class="eyebrow">感情語彙図鑑</p>
    <h1>10分類の感情語</h1>
  `;

  const categories = lexicon?.categories ?? {};
  for (const [category, words] of Object.entries(categories)) {
    const details = document.createElement("details");
    details.className = "accordion";
    details.open = category === Object.keys(categories)[0];
    details.innerHTML = `<summary>${category}<span>${words.length}語</span></summary>`;
    const list = document.createElement("div");
    list.className = "word-grid";
    for (const item of words) {
      const detail = document.createElement("details");
      detail.className = "word-chip";
      detail.innerHTML = `
        <summary>${item.word}</summary>
        <p>${(item.variants ?? []).join(" / ") || "variants なし"}</p>
      `;
      list.append(detail);
    }
    details.append(list);
    root.append(details);
  }

  return root;
}
