// 100本ノック（フォローアップクエスチョン生成練習）の型定義とデータ展開。
// 型の定義は docs/followup/FOLLOWUP_PATTERNS.md を正とする（詳細は具体化・背景に分けて8型）。

export const KNOCK_TYPES = {
  "1a": {
    num: "①",
    label: "詳細（具体化）",
    short: "具体化",
    anchor: "具体的には、どういうことですか？",
    hint: "曖昧な言葉・内容を明確にする。相手の言葉をそのまま拾うと尋問感が出にくい",
  },
  "1b": {
    num: "①",
    label: "詳細（背景）",
    short: "背景",
    anchor: "きっかけは何だったんですか？",
    hint: "経緯・きっかけ・やり方・時期など「過去の事実」を引き出す",
  },
  "2": {
    num: "②",
    label: "感想・意見",
    short: "意見",
    anchor: "〜については、どう思ってますか？",
    hint: "対象への率直な評価・感想を聞く",
  },
  "3": {
    num: "③",
    label: "理由・目的",
    short: "理由",
    anchor: "それを選んだ決め手は何だったんですか？",
    hint: "今の動機・価値・狙いを聞く（経緯を聞く背景とは区別）",
  },
  "4": {
    num: "④",
    label: "結果・影響",
    short: "結果",
    anchor: "それで、どうなったんですか？",
    hint: "すでに起きたことの続き・変化・周りの反応を聞く",
  },
  "5": {
    num: "⑤",
    label: "対策・次の一手",
    short: "次の一手",
    anchor: "次は、どうするんですか？",
    hint: "まだ起きていないこれからの予定・対策を聞く",
  },
  "6": {
    num: "⑥",
    label: "比較・対比",
    short: "比較",
    anchor: "他のと比べて、どうなんですか？",
    hint: "他のもの・他の人・昔と対比させて語ってもらう",
  },
  "7": {
    num: "⑦",
    label: "振り返り",
    short: "振り返り",
    anchor: "今振り返ってみて、どうですか？",
    hint: "自分の過去を今の視点で再解釈してもらう",
  },
};

export const KNOCK_TYPE_ORDER = ["1a", "1b", "2", "3", "4", "5", "6", "7"];

export const KNOCK_CHECKLIST = [
  "指定された型の質問になっている（型の狙いに合った情報が引き出せる）",
  "尋問調・書き言葉ではなく、雑談で口にできる自然な言い方になっている",
  "相手の回答に出てきた言葉・出来事を拾って質問している",
];

/**
 * マスターデータ（{ topics, personas, items }）を、(回答文 × 型) の仮想問題に展開する。
 * 1回答文につき8問、50回答文で400問。id は `${item.id}_${type}`。
 * 各問題は指定の型の模範解答3例（models）と、他の型の模範（allQuestions）を持つ。
 */
export function expandKnock(master) {
  const topics = master?.topics ?? {};
  const personas = master?.personas ?? {};
  return (master?.items ?? []).flatMap((item) =>
    KNOCK_TYPE_ORDER
      .filter((type) => item.questions?.[type])
      .map((type) => ({
        id: `${item.id}_${type}`,
        kind: "knock",
        baseId: item.id,
        type,
        category: KNOCK_TYPES[type].short,
        topic: item.topic,
        topicLabel: topics[item.topic] ?? "",
        persona: personas[item.persona] ?? { name: "", profile: "" },
        answer: item.answer,
        models: item.questions[type],
        allQuestions: item.questions,
      })),
  );
}

function shuffle(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * ノック用の出題 id 列を組む（純関数）。
 * - 回答文を1周ずつ回し、各周で回答文ごとにランダムな型を1つ選ぶ（同じ回答文が連続しにくい）
 * - 同一セッション内で同じ (回答文, 型) は出さない
 * - 未回答の (回答文, 型) を優先する
 */
export function buildKnockSessionIds(items, count = 100, records = {}, random = Math.random) {
  const byBase = new Map();
  for (const q of items) {
    if (!byBase.has(q.baseId)) byBase.set(q.baseId, []);
    byBase.get(q.baseId).push(q);
  }
  const bases = [...byBase.keys()];
  const used = new Map();
  const ids = [];
  const maxPasses = KNOCK_TYPE_ORDER.length;
  for (let pass = 0; pass < maxPasses && ids.length < count; pass += 1) {
    for (const baseId of shuffle(bases, random)) {
      if (ids.length >= count) break;
      const usedTypes = used.get(baseId) ?? new Set();
      const pool = byBase.get(baseId).filter((q) => !usedTypes.has(q.type));
      if (!pool.length) continue;
      const untried = pool.filter((q) => !records[q.id]?.attempts?.length);
      const candidates = untried.length ? untried : pool;
      const pick = candidates[Math.floor(random() * candidates.length)];
      usedTypes.add(pick.type);
      used.set(baseId, usedTypes);
      ids.push(pick.id);
    }
  }
  return ids;
}
