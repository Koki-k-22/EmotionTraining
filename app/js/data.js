export async function loadQuestions() {
  const response = await fetch("./data/questions_novel_v1.json");
  if (!response.ok) {
    throw new Error("問題データを読み込めませんでした");
  }
  return response.json();
}

export async function loadLexicon() {
  const response = await fetch("./data/emotion_lexicon.json");
  if (!response.ok) {
    throw new Error("語彙データを読み込めませんでした");
  }
  return response.json();
}

export async function loadAppData() {
  const [questions, lexicon] = await Promise.all([loadQuestions(), loadLexicon()]);
  return { questions, lexicon };
}
