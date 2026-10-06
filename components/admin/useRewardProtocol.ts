"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { awardRewardProtocol } from "@/app/actions/admin-rewards";
import type { RewardCategory, RewardProtocolData } from "@/lib/reward-protocol";
import type { RewardStudent } from "@/components/admin/RewardStudentPicker";

export function useRewardProtocol({
  protocol,
  students,
  attendanceAwards,
  weeks,
  today,
}: {
  protocol: RewardProtocolData;
  students: RewardStudent[];
  attendanceAwards: { student_id: string; reward_key: string }[];
  weeks: { week_number: number; starts_on: string; ends_on: string; boost_multiplier: number }[];
  today: string;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<RewardCategory>("attendance");
  const [rewardKey, setRewardKey] = useState<string>(protocol.attendance.rewards[0].key);
  const [eventLabel, setEventLabel] = useState("");
  const [awardDate, setAwardDate] = useState(today);
  const [selectedGroup, setSelectedGroup] = useState("ALL");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const reward = protocol[category].rewards.find((item) => item.key === rewardKey) ?? protocol[category].rewards[0];
  const selectedWeek = weeks.find((week) => week.starts_on <= awardDate && week.ends_on >= awardDate);
  const boostMultiplier = selectedWeek ? Number(selectedWeek.boost_multiplier) : null;
  const finalXPPerStudent = boostMultiplier === null ? null : Math.round(reward.xp * boostMultiplier);
  const groups = useMemo(() => [...new Set(students.map((student) => student.group_id).filter((group): group is string => Boolean(group)))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })), [students]);
  const alreadyAwarded = useMemo(() => new Set(attendanceAwards.filter((award) => award.reward_key === reward.key).map((award) => award.student_id)), [attendanceAwards, reward.key]);
  const visibleStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return students.filter((student) => {
      const groupMatches = selectedGroup === "ALL" || student.group_id === selectedGroup;
      const queryMatches = !normalizedQuery || `${student.full_name} ${student.student_id} ${student.group_id || ""}`.toLocaleLowerCase().includes(normalizedQuery);
      return groupMatches && queryMatches;
    });
  }, [query, selectedGroup, students]);
  const eligibleVisible = visibleStudents.filter((student) => category !== "attendance" || !alreadyAwarded.has(student.id));
  const selectedCount = selectedIds.size;
  const totalXP = selectedCount * (finalXPPerStudent ?? 0);
  const allVisibleSelected = eligibleVisible.length > 0 && eligibleVisible.every((student) => selectedIds.has(student.id));

  const changeCategory = (nextCategory: RewardCategory) => {
    setCategory(nextCategory);
    setRewardKey(protocol[nextCategory].rewards[0].key);
    setEventLabel("");
    setSelectedIds(new Set());
    setFeedback(null);
  };

  const toggleStudent = (studentId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) eligibleVisible.forEach((student) => next.delete(student.id));
      else eligibleVisible.forEach((student) => next.add(student.id));
      return next;
    });
  };

  const submitAward = async () => {
    if (!selectedCount || submitting) return;
    if (category !== "attendance" && !eventLabel.trim()) {
      setFeedback({ type: "error", text: "Add an event name, such as Assignment 2 or Office hours — 6 Oct." });
      return;
    }
    const confirmation = `Award ${reward.xp} XP for ${reward.item} to ${selectedCount} student${selectedCount === 1 ? "" : "s"} (${totalXP} XP total)?`;
    if (!window.confirm(confirmation)) return;

    setSubmitting(true);
    setFeedback(null);
    const result = await awardRewardProtocol(category, reward.key, eventLabel, [...selectedIds], awardDate);
    setSubmitting(false);
    if (!result.success) {
      setFeedback({ type: "error", text: result.message || "The reward could not be issued." });
      return;
    }

    setSelectedIds(new Set());
    setEventLabel("");
    setFeedback({ type: "success", text: `${result.item} awarded to ${result.count} students: +${result.baseAmount} × ${result.boostMultiplier} = ${result.amount} XP each.` });
    router.refresh();
  };

  return {
    category, reward, selectedWeek, boostMultiplier, finalXPPerStudent,
    groups, alreadyAwarded, visibleStudents, eligibleVisible, selectedCount,
    totalXP, allVisibleSelected, eventLabel, setEventLabel, awardDate, setAwardDate,
    selectedGroup, setSelectedGroup, query, setQuery, selectedIds,
    submitting, feedback, setFeedback, setSelectedIds, setRewardKey,
    changeCategory, toggleStudent, toggleVisible, submitAward,
  };
}
