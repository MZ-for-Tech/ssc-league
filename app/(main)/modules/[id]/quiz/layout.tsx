import { createPageMetadata } from "@/lib/site-metadata";
import { getTopicNameForMetadata } from "@/lib/topic-metadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topicName = await getTopicNameForMetadata(id);
  return createPageMetadata(`${topicName} Quiz`, `Test your understanding of ${topicName} with an SSC2 League quiz.`);
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
