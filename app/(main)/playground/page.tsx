import PythonPlayground from "@/components/PythonPlayground";
import { Cpu } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Training Ground | SSC2 League",
  description: "Run Python in your browser with scientific libraries loaded when imported.",
};

const starterCode = `# Mission report
def mission_report(agent_name):
    return f"Agent {agent_name} is ready for deployment."

print(mission_report("Ezz"))
`;

export default function PlaygroundPage() {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
      <PageHeader
        title="Training Ground"
        icon={<Cpu size={27} />}
      />

      <PythonPlayground initialCode={starterCode} />
    </div>
  );
}
