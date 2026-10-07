import PageHeaderSkeleton from "@/components/PageHeaderSkeleton";
import { QuestionBankSkeleton } from "@/components/admin/QuestionBankParts";

export default function QuestionBankLoading() {
  return (
    <div className="app-page-stack w-full pb-16" aria-busy="true" aria-label="Loading question bank">
      <PageHeaderSkeleton titleWidth="w-56" actionWidths={["w-32", "w-28", "w-40"]} actionHeight="h-11" />
      <QuestionBankSkeleton />
    </div>
  );
}
