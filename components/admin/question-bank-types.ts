import type { loadAdminQuestionBank } from "@/app/actions/question-bank-actions";

export type AdminQuestionBank = Awaited<ReturnType<typeof loadAdminQuestionBank>>;
export type BankQuestion = AdminQuestionBank["questions"][number];
export type BankTopic = AdminQuestionBank["topics"][number];
export type LessonTopic = BankTopic & { questionCount: number; essayCount: number };
export type LessonGroup = {
  id: string;
  number: number | null;
  name: string;
  lessons: LessonTopic[];
};
