"use server";

import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SELECTED_SEASON_COOKIE } from "@/lib/seasons";

export async function setLeagueSeason(seasonId: string) {
  if (!seasonId || typeof seasonId !== "string") {
    throw new Error("Choose a valid league season.");
  }

  const { adminClient } = await requireAdmin();
  const { data: season, error } = await adminClient
    .from("Season")
    .select("id, status")
    .eq("id", seasonId)
    .maybeSingle();

  if (error || !season || (season.status !== "active" && season.status !== "archived")) {
    throw new Error("That league season is not available.");
  }

  const cookieStore = await cookies();
  cookieStore.set(SELECTED_SEASON_COOKIE, season.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { success: true };
}

export async function resetLeagueSeasonSelection() {
  const cookieStore = await cookies();
  cookieStore.delete(SELECTED_SEASON_COOKIE);
  return { success: true };
}
