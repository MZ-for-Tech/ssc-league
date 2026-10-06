"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getRewardProtocolItem, REWARD_PROTOCOL, type RewardCategory } from "@/lib/reward-protocol";
import { SELECTED_SEASON_COOKIE } from "@/lib/seasons";
import { errorMessage, logAudit } from "./admin-action-helpers";

export async function awardRewardProtocol(
  category: RewardCategory,
  rewardKey: string,
  eventLabel: string,
  studentIds: string[],
  awardDate: string,
) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const defaultReward = getRewardProtocolItem(category, rewardKey);
    if (!defaultReward) throw new Error("Choose a reward from the published protocol.");
    const { data: configuredReward, error: configuredRewardError } = await supabaseAdmin
      .from("RewardProtocolTask")
      .select("reward_label, xp")
      .eq("category", category)
      .eq("reward_key", rewardKey)
      .maybeSingle();
    if (configuredRewardError) throw configuredRewardError;
    if (!configuredReward) throw new Error("The selected reward is missing from the current protocol. Refresh and try again.");
    const reward = { ...defaultReward, item: configuredReward.reward_label, xp: configuredReward.xp };

    const uniqueStudentIds = [...new Set(studentIds)];
    if (!uniqueStudentIds.length) throw new Error("Select at least one student.");
    if (uniqueStudentIds.length > 500) throw new Error("Award the protocol reward to at most 500 students at a time.");

    const normalizedEventLabel = category === "attendance" ? reward.item : eventLabel.trim();
    if (!normalizedEventLabel) throw new Error("Enter an event name for this reward.");
    if (normalizedEventLabel.length > 100) throw new Error("Event name must be 100 characters or fewer.");
    const parsedAwardDate = new Date(`${awardDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(awardDate) || Number.isNaN(parsedAwardDate.valueOf()) || parsedAwardDate.toISOString().slice(0, 10) !== awardDate) {
      throw new Error("Choose a valid award date.");
    }

    const { data: week, error: weekError } = await supabaseAdmin
      .from("SeasonWeek")
      .select("week_number, boost_multiplier")
      .eq("season_id", activeSeasonId)
      .lte("starts_on", awardDate)
      .gte("ends_on", awardDate)
      .maybeSingle();
    if (weekError) throw weekError;
    if (!week) throw new Error("Add a week covering this award date in the season schedule first.");

    const { data, error } = await supabaseAdmin.rpc("award_reward_protocol", {
      p_category: category,
      p_reward_key: reward.key,
      p_reward_label: reward.item,
      p_event_label: normalizedEventLabel,
      p_base_amount: reward.xp,
      p_student_ids: uniqueStudentIds,
      p_award_date: awardDate,
      p_admin_id: adminId,
    });
    if (error) throw new Error(error.message || "The reward could not be issued.");

    const result = Array.isArray(data) ? data[0] : data;
    const count = result?.recipient_count ?? uniqueStudentIds.length;
    const boostMultiplier = Number(week.boost_multiplier);
    const finalAmount = Math.round(reward.xp * boostMultiplier);
    revalidatePath("/admin");
    return { success: true, count, amount: finalAmount, baseAmount: reward.xp, boostMultiplier, item: reward.item, weekNumber: week.week_number };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}

export async function saveRewardProtocolValues(values: { category: RewardCategory; rewardKey: string; xp: number }[]) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    const selectedSeasonId = (await cookies()).get(SELECTED_SEASON_COOKIE)?.value;
    if (selectedSeasonId && selectedSeasonId !== activeSeasonId) {
      throw new Error("Switch to the active season before changing reward values.");
    }

    const tasks = (Object.keys(REWARD_PROTOCOL) as RewardCategory[]).flatMap((category) =>
      REWARD_PROTOCOL[category].rewards.map((reward) => ({ category, rewardKey: reward.key, rewardLabel: reward.item })),
    );
    if (!Array.isArray(values) || values.length !== tasks.length) {
      throw new Error("The reward task list is incomplete. Refresh the page and try again.");
    }

    const valuesByTask = new Map<string, number>();
    for (const value of values) {
      const key = `${value.category}:${value.rewardKey}`;
      if (valuesByTask.has(key) || !tasks.some((task) => `${task.category}:${task.rewardKey}` === key)) {
        throw new Error("The reward task list contains an unknown or duplicate task.");
      }
      if (!Number.isInteger(value.xp) || value.xp < 1 || value.xp > 1000) {
        throw new Error("Each reward value must be a whole number from 1 to 1000 XP.");
      }
      valuesByTask.set(key, value.xp);
    }

    const rows = tasks.map((task, index) => ({
      category: task.category,
      reward_key: task.rewardKey,
      reward_label: task.rewardLabel,
      xp: valuesByTask.get(`${task.category}:${task.rewardKey}`)!,
      sort_order: index,
      updated_by: adminId,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin
      .from("RewardProtocolTask")
      .upsert(rows, { onConflict: "category,reward_key" });
    if (error) throw error;

    await logAudit(supabaseAdmin, adminId, "REWARD_PROTOCOL_UPDATED", `Updated XP values for ${rows.length} reward tasks`, "Reward protocol", activeSeasonId);
    revalidatePath("/admin");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}
