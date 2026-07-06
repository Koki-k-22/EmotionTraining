export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, "");
}

function addCandidate(candidates, word, result) {
  const normalized = normalizeText(word);
  if (!normalized) return;
  candidates.push({ word: String(word), normalized, result });
}

function getCandidates(q) {
  const candidates = [];

  addCandidate(candidates, q?.answer?.word, "best");
  addCandidate(candidates, q?.answer?.surface, "best");

  for (const item of q?.ok ?? []) {
    addCandidate(candidates, item.word, "ok");
  }

  for (const item of q?.poor ?? []) {
    addCandidate(candidates, item.word, "poor");
  }

  return candidates.sort((a, b) => b.normalized.length - a.normalized.length);
}

export function gradeAnswer(input, q) {
  const normalizedInput = normalizeText(input);
  if (!normalizedInput) {
    return { result: "unknown", matched: null };
  }

  const match = getCandidates(q).find((candidate) =>
    normalizedInput.includes(candidate.normalized),
  );

  if (!match) {
    return { result: "unknown", matched: null };
  }

  return {
    result: match.result,
    matched: match.word,
  };
}
