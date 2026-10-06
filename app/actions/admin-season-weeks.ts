"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { errorMessage, logAudit } from "./admin-action-helpers";

type SeasonWeekInput = {
  weekNumber: number;
  startsOn: string;
  endsOn: string;
  boostMultiplier: number;
};

export async function saveSeasonWeek(input: SeasonWeekInput) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    if (!Number.isInteger(input.weekNumber) || input.weekNumber < 1 || input.weekNumber > 60) {
      throw new Error("Week number must be between 1 and 60.");
    }
    if (!Number.isFinite(input.boostMultiplier) || input.boostMultiplier <= 0 || input.boostMultiplier > 10) {
      throw new Error("XP multiplier must be greater than 0 and at most 10.");
    }
    const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).valueOf()) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
    if (!validDate(input.startsOn) || !validDate(input.endsOn) || input.startsOn > input.endsOn) {
      throw new Error("Choose a valid week date range.");
    }

    const { data: weeks, error: weeksError } = await supabaseAdmin
      .from("SeasonWeek")
      .select("week_number, starts_on, ends_on")
      .eq("season_id", activeSeasonId);
    if (weeksError) throw weeksError;
    const existingWeek = (weeks ?? []).find((week) => week.week_number === input.weekNumber);
    if (existingWeek && (existingWeek.starts_on !== input.startsOn || existingWeek.ends_on !== input.endsOn)) {
      const [{ count: rewards, error: rewardError }, { count: attendance, error: attendanceError }] = await Promise.all([
        supabaseAdmin.from("RewardProtocolBatch").select("id", { count: "exact", head: true }).eq("season_id", activeSeasonId).eq("week_number", input.weekNumber),
        supabaseAdmin.from("AttendanceRecord").select("id", { count: "exact", head: true }).eq("season_id", activeSeasonId).eq("week_number", input.weekNumber),
      ]);
      if (rewardError) throw rewardError;
      if (attendanceError) throw attendanceError;
      if ((rewards ?? 0) > 0 || (attendance ?? 0) > 0) throw new Error("Week dates cannot be changed after attendance or rewards have been recorded. The XP multiplier can still be updated.");
    }
    const overlaps = (weeks ?? []).some((week) => week.week_number !== input.weekNumber && input.startsOn <= week.ends_on && input.endsOn >= week.starts_on);
    if (overlaps) throw new Error("Week dates cannot overlap another week in this season.");

    const { error } = await supabaseAdmin.from("SeasonWeek").upsert({
      season_id: activeSeasonId,
      week_number: input.weekNumber,
      starts_on: input.startsOn,
      ends_on: input.endsOn,
      boost_multiplier: input.boostMultiplier,
    }, { onConflict: "season_id,week_number" });
    if (error) throw error;

    await logAudit(supabaseAdmin, adminId, "SEASON_WEEK", `Saved week ${input.weekNumber} (${input.boostMultiplier}× XP)`, `${input.startsOn}–${input.endsOn}`, activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}

export async function deleteSeasonWeek(weekNumber: number) {
  try {
    const { adminClient: supabaseAdmin, adminId, activeSeasonId } = await requireAdmin();
    if (!Number.isInteger(weekNumber) || weekNumber < 1) throw new Error("Choose a valid week.");

    const [{ count: rewards, error: rewardError }, { count: attendance, error: attendanceError }] = await Promise.all([
      supabaseAdmin.from("RewardProtocolBatch").select("id", { count: "exact", head: true }).eq("season_id", activeSeasonId).eq("week_number", weekNumber),
      supabaseAdmin.from("AttendanceRecord").select("id", { count: "exact", head: true }).eq("season_id", activeSeasonId).eq("week_number", weekNumber),
    ]);
    if (rewardError) throw rewardError;
    if (attendanceError) throw attendanceError;
    if ((rewards ?? 0) > 0 || (attendance ?? 0) > 0) throw new Error("This week already has attendance or reward records and cannot be deleted.");

    const { error } = await supabaseAdmin.from("SeasonWeek").delete().eq("season_id", activeSeasonId).eq("week_number", weekNumber);
    if (error) throw error;
    await logAudit(supabaseAdmin, adminId, "SEASON_WEEK", `Deleted week ${weekNumber}`, String(weekNumber), activeSeasonId);
    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: errorMessage(err) };
  }
}
