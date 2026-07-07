async function loadJson(path, label) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${label}を読み込めませんでした`);
  }
  return response.json();
}

export async function loadQuestionSets() {
  const [practice, reading] = await Promise.all([
    loadJson("./data/questions_car_v1.json", "創作問題データ"),
    loadJson("./data/questions_novel_v1.json", "読解問題データ"),
  ]);
  return {
    practice,
    reading,
    all: [...practice, ...reading],
  };
}

export async function loadQuestions() {
  const questionSets = await loadQuestionSets();
  return questionSets.all;
}

export async function loadLexicon() {
  return loadJson("./data/emotion_lexicon.json", "語彙データ");
}

export async function loadAppData() {
  const [questionSets, lexicon] = await Promise.all([loadQuestionSets(), loadLexicon()]);
  return { questions: questionSets.all, questionSets, lexicon };
}
