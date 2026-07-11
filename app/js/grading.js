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

export function isDeepQuestion(q) {
  return Boolean(q?.deep?.best?.length);
}

function matchKeyGroups(normalizedInput, keys) {
  if (!Array.isArray(keys) || keys.length === 0) return false;
  return keys.every((group) =>
    Array.isArray(group) &&
    group.some((stem) => {
      const normalized = normalizeText(stem);
      return normalized && normalizedInput.includes(normalized);
    }),
  );
}

export function gradeAnswerAL(input, q) {
  const normalizedInput = normalizeText(input);
  if (!normalizedInput) {
    return { result: "unknown", matched: null };
  }

  for (const item of q?.deep?.best ?? []) {
    if (matchKeyGroups(normalizedInput, item.keys)) {
      return { result: "best", matched: item.phrase };
    }
  }

  const surfaceWords = [q?.surface?.word, ...(q?.surface?.synonyms ?? [])]
    .map((word) => ({ word, normalized: normalizeText(word) }))
    .filter((item) => item.normalized)
    .sort((a, b) => b.normalized.length - a.normalized.length);
  const surfaceHit = surfaceWords.find((item) => normalizedInput.includes(item.normalized));
  if (surfaceHit) {
    return { result: "ok", matched: surfaceHit.word };
  }

  return { result: "unknown", matched: null };
}
