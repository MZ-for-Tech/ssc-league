export const REWARD_PROTOCOL = {
  attendance: {
    label: "Attendance track",
    rewards: [
      { key: "first_two_weeks", item: "First 2 weeks", xp: 10 },
      { key: "sessions_1_2", item: "Sessions 1–2", xp: 10 },
      { key: "sessions_3_4", item: "Sessions 3–4", xp: 15 },
      { key: "sessions_5_6", item: "Sessions 5–6", xp: 20 },
      { key: "sessions_7_plus", item: "7+ sessions", xp: 25 },
    ],
  },
  coursework: {
    label: "Coursework",
    rewards: [
      { key: "pass_quiz", item: "Pass a Quiz", xp: 20 },
      { key: "practice_exam", item: "Practice exam", xp: 10 },
      { key: "assignment", item: "Submit an assignment", xp: 30 },
      { key: "project", item: "Project", xp: 40 },
      { key: "midterm_exam", item: "Pass midterm exam", xp: 40 },
    ],
  },
  participation: {
    label: "Participation",
    rewards: [
      { key: "punctuality", item: "Punctuality", xp: 10 },
      { key: "office_hours", item: "Office hours", xp: 10 },
      { key: "group_participation", item: "Group participation", xp: 15 },
      { key: "extra_effort", item: "Extra effort", xp: 20 },
      { key: "knowledge_sharing", item: "Knowledge sharing", xp: 20 },
    ],
  },
} as const;

export type RewardCategory = keyof typeof REWARD_PROTOCOL;
export type RewardProtocolData = {
  [Category in RewardCategory]: {
    label: string;
    rewards: { key: string; item: string; xp: number }[];
  };
};

export type RewardProtocolValue = { category: RewardCategory; reward_key: string; xp: number };

export function mergeRewardProtocol(values: RewardProtocolValue[] = []): RewardProtocolData {
  const xpByTask = new Map(values.map((value) => [`${value.category}:${value.reward_key}`, value.xp]));
  return Object.fromEntries(
    (Object.keys(REWARD_PROTOCOL) as RewardCategory[]).map((category) => [
      category,
      {
        label: REWARD_PROTOCOL[category].label,
        rewards: REWARD_PROTOCOL[category].rewards.map((reward) => ({
          ...reward,
          xp: xpByTask.get(`${category}:${reward.key}`) ?? reward.xp,
        })),
      },
    ]),
  ) as RewardProtocolData;
}

export function getRewardProtocolItem(category: string, rewardKey: string) {
  if (!Object.hasOwn(REWARD_PROTOCOL, category)) return null;
  const rewards = REWARD_PROTOCOL[category as RewardCategory].rewards;
  return rewards.find((reward) => reward.key === rewardKey) ?? null;
}
