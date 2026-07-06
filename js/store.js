const KEYS = {
  records: "et.records",
  settings: "et.settings",
  streak: "et.streak",
};

const REVIEW_DELAYS = [0, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a, b) {
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

export function getRecords() {
  return readJson(KEYS.records, {});
}

export function setRecords(records) {
  writeJson(KEYS.records, records);
}

export function getSettings() {
  return readJson(KEYS.settings, { theme: "auto" });
}

export function setSettings(settings) {
  writeJson(KEYS.settings, { ...getSettings(), ...settings });
}

export function getStreak() {
  return readJson(KEYS.streak, { lastDay: "", days: 0 });
}

export function touchStreak(date = new Date()) {
  const streak = getStreak();
  const today = todayKey(date);

  if (streak.lastDay === today) {
    return streak;
  }

  const days = streak.lastDay && daysBetween(streak.lastDay, today) === 1
    ? streak.days + 1
    : 1;
  const next = { lastDay: today, days };
  writeJson(KEYS.streak, next);
  return next;
}

export function recordAttempt(questionId, input, result, date = new Date()) {
  const records = getRecords();
  const previous = records[questionId] ?? { attempts: [], box: 0, nextReview: 0 };
  const isCorrect = result === "best" || result === "ok";
  const box = isCorrect ? Math.min(3, (previous.box ?? 0) + 1) : 0;
  const delay = isCorrect ? REVIEW_DELAYS[box] : 0;
  const ts = date.getTime();

  records[questionId] = {
    attempts: [...(previous.attempts ?? []), { ts, input, result }],
    box,
    nextReview: ts + delay,
  };

  setRecords(records);
  touchStreak(date);
  return records[questionId];
}

export function getDueQuestionIds(now = Date.now()) {
  return Object.entries(getRecords())
    .filter(([, record]) => (record.nextReview ?? 0) <= now && (record.attempts ?? []).length > 0)
    .map(([id]) => id);
}

export function getReviewCount(now = Date.now()) {
  return getDueQuestionIds(now).length;
}

export function getStats(questions) {
  const records = getRecords();
  const attempts = Object.entries(records).flatMap(([questionId, record]) =>
    (record.attempts ?? []).map((attempt) => ({ ...attempt, questionId })),
  );
  const bestCount = attempts.filter((attempt) => attempt.result === "best").length;
  const byCategory = {};

  for (const q of questions) {
    byCategory[q.category] ??= { total: 0, best: 0 };
  }

  for (const attempt of attempts) {
    const q = questions.find((item) => item.id === attempt.questionId);
    if (!q) continue;
    byCategory[q.category] ??= { total: 0, best: 0 };
    byCategory[q.category].total += 1;
    if (attempt.result === "best") {
      byCategory[q.category].best += 1;
    }
  }

  return {
    total: attempts.length,
    bestRate: attempts.length ? bestCount / attempts.length : 0,
    byCategory,
    streak: getStreak(),
  };
}
