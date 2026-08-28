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

export function isFollowupQuestion(q) {
  return q?.kind === "followup";
}

export function gradeFollowup(choice, q) {
  const key = String(choice ?? "");
  if (!key) {
    return { result: "unknown", matched: null };
  }
  if (key === q?.answer) {
    return { result: "best", matched: key };
  }
  if ((q?.ok ?? []).includes(key)) {
    return { result: "ok", matched: key };
  }
  return { result: "miss", matched: key };
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

// ---- 100本ノック（質問生成）----
// 自由記述の質問は自動採点しない（自己採点）。キーワードから「どの型に見えるか」だけをヒントとして返す。

export function isKnockQuestion(q) {
  return q?.kind === "knock";
}

const KNOCK_PATTERNS = {
  "1a": [
    /具体的/, /例えば|たとえば/, /どういう(意味|こと)/, /どんな(感じ|内容|もの|こと|ふう|風|の)/,
    /どのくらい|どれくらい|どの程度/, /どのあたり|どこが|どこまで/, /何(を|人|個|回|時間|軒|作品|冊)/, /中身/,
  ],
  "1b": [
    /きっかけ/, /いつ(から|頃|ごろ|の)/, /経緯/, /流れ/, /どうやって|どのように/, /誰(に|と|から|が)/,
    /何歳/, /背景/, /始め(た|る)(の|きっかけ|時)/, /知った/, /時期/,
  ],
  "2": [
    /どう(思|感じ|考え|受け止め|見え)/, /感想/, /的には/, /どうでした/, /どうですか/, /どんな気持ち/,
    /率直/, /正直/, /どう(いう|んな)(存在|意味|もの)/,
  ],
  "3": [
    /なんで|なぜ|何で/, /どうして(?!い)/, /決め手/, /狙い/, /何のため/, /理由/, /目的/, /こだわ/,
    /何が(そんなに|一番|大きか|支え|そこまで|原動力)/, /(いい|良い|よい|楽しい|面白い|おもしろい)んですか/,
  ],
  "4": [
    /どうな(った|りました|ってる|っている)/, /反応/, /変わりました|変わった|変化/, /影響/,
    /その後|それで|それから|そのあと/, /結局/, /うまくいった|うまくいきました/, /間に合/,
  ],
  "5": [
    /次(は|に|の)/, /これから|今後/, /予定/, /つもり/, /対策/, /(やって|行って|試して|出て)みたい/,
    /目標/, /どうしてい(く|き)/, /続け(る|て)いく/, /するようにして/,
  ],
  "6": [
    /比べ/, /違(い|う|って|いま)/, /他の|ほかの|他に/, /昔と|前と|当時と|頃と/, /どっち|どちら/, /共通点/,
    /同じ(よう|感じ|こと)/, /周りの(人|友達|同僚)/,
  ],
  "7": [
    /振り返/, /今(思うと|思えば|にして|だったら)/, /(当時|あの時|昔|始める前|その時)の自分/, /自分に(言|教え|一言)/,
    /やり直せ/, /活き|生きて/, /学んだ|学び/, /転機/, /正解だった/, /(よかった|良かった)(と|って|なって)思/,
    /一番(大変|きつ|良かった|よかった|救われ)/,
  ],
};

export function detectKnockTypes(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return Object.entries(KNOCK_PATTERNS)
    .filter(([, patterns]) => patterns.some((pattern) => pattern.test(normalized)))
    .map(([key]) => key);
}

export function gradeKnock(input) {
  const text = String(input ?? "");
  if (!normalizeText(text)) {
    return { result: "unknown", matched: null };
  }
  return { result: "unknown", matched: detectKnockTypes(text) };
}
