"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, Trophy, Loader2, Zap, Target, AlertCircle, Terminal, XCircle } from "lucide-react";
import clsx from "clsx";
import PythonCodeBlock from "@/components/PythonCodeBlock";
import PythonPlayground from "@/components/PythonPlayground";
import ReportButton from "@/components/ReportButton";
import { useLeagueSeasonId } from "@/components/LeagueSeasonContext";
import { loadActiveQuiz, submitQuizAnswer } from "@/app/actions/quiz-actions";

// --- TYPES ---
type Option = { id: string; text: string };
type OptionFeedback = { optionId: string; isCorrect: boolean; justification: string | null };
type QuizFeedback = { correctOptionId: string | null; optionFeedback: OptionFeedback[] };
type Question = { id: string; text: string; points: number; stimulus_code: string | null; stimulus_asset_url: string | null; stimulus_asset_alt: string | null; QuestionOption: Option[]; feedback: QuizFeedback | null };

type AnswerRecord = {
    question_id: string;
    selected_option_id: string;
    is_correct: boolean;
};

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter();
  const selectedSeasonId = useLeagueSeasonId();
  
  // State
  const [studentDbId, setStudentDbId] = useState<string | null>(null);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, AnswerRecord>>({});
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [score, setScore] = useState(0);
  const [quizState, setQuizState] = useState<"loading" | "active" | "finished">("loading");
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);

  // 1. Initialization
  useEffect(() => {
    const initPage = async () => {
      try {
      const quizData = await loadActiveQuiz(id);
      if (selectedSeasonId && selectedSeasonId !== quizData.seasonId) {
        router.replace(`/modules/${id}`);
        return;
      }
      setActiveSeasonId(quizData.seasonId);
      setStudentDbId(quizData.studentId);

      const typedQuestions = quizData.questions as Question[];
      setQuestions(typedQuestions);

      const loadedAnswers: Record<string, AnswerRecord> = {};
      let initialScore = 0;
      
      quizData.answers.forEach((ans: AnswerRecord) => {
          loadedAnswers[ans.question_id] = ans;
          if (ans.is_correct) initialScore += 2; else initialScore += 1;
      });

      setAnswersMap(loadedAnswers);
      setScore(initialScore);

      // Restore state for first question
      if (typedQuestions.length > 0) {
          const firstQ = typedQuestions[0];
          if (loadedAnswers[firstQ.id]) {
              setSelectedOption(loadedAnswers[firstQ.id].selected_option_id);
              setShowFeedback(true);
              setIsLocked(true);
              setFeedback(firstQ.feedback);
          }
      }

      setQuizState("active");
      } catch (error) {
        setLoadMessage(error instanceof Error ? error.message : "Could not load this lesson.");
      }
    };

    initPage();
  }, [id, router, selectedSeasonId]);

  // --- NEW: NAVIGATION FUNCTION ---
  const jumpToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;

    const targetQ = questions[index];
    const existingAns = answersMap[targetQ.id];

    // Restore state based on whether the target question is answered
    if (existingAns) {
        setSelectedOption(existingAns.selected_option_id);
        setShowFeedback(true);
        setIsLocked(true);
        setFeedback(targetQ.feedback);
    } else {
        setSelectedOption(null);
        setShowFeedback(false);
        setIsLocked(false);
        setFeedback(null);
    }
    setCurrentQIndex(index);
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
        jumpToQuestion(currentQIndex + 1);
    } else {
        setQuizState("finished");
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !studentDbId || !activeSeasonId || isLocked) return;
    setIsSubmitting(true);

    const currentQ = questions[currentQIndex];
    try {
      const result = await submitQuizAnswer(currentQ.id, selectedOption);
      const isCorrect = result.isCorrect;
      setScore((prev) => prev + (isCorrect ? 2 : 1));
      setFeedback({ correctOptionId: result.correctOptionId, optionFeedback: result.optionFeedback });
      setAnswersMap((prev) => ({
        ...prev,
        [currentQ.id]: { question_id: currentQ.id, selected_option_id: selectedOption, is_correct: isCorrect },
      }));
      setShowFeedback(true);
      setIsLocked(true);
    } catch (error) {
      setLoadMessage(error instanceof Error ? error.message : "Could not save this answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (quizState === "loading" && loadMessage) return <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-border bg-surface/70 p-6 text-center"><p className="text-foreground">{loadMessage}</p><button onClick={() => router.push(`/modules/${id}`)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Back to module <ArrowRight size={16} /></button></div>;
  if (quizState === "loading") return <div className="flex h-[50vh] items-center justify-center text-primary"><Loader2 className="animate-spin w-10 h-10" /></div>;
  if (!questions.length) return <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-border bg-surface/70 p-6 text-center"><p className="font-semibold text-foreground">No multiple-choice questions are available for this lesson yet.</p><Link href={`/modules/${id}/essays`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Open written responses <ArrowRight size={16} /></Link></div>;
  
  if (quizState === "finished") {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 rounded-2xl bg-surface/50 border border-border text-center animate-in zoom-in-95">
        <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-b from-primary/20 to-primary-dim/20 border border-primary/50"><Trophy className="w-16 h-16 text-primary" /></div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Mission Complete</h2>
        <p className="text-muted mb-8">Performance Data Uploaded.</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-surface rounded-xl border border-border">
                <div className="text-muted text-xs uppercase tracking-wider mb-1">Questions</div>
                <div className="text-2xl font-bold text-foreground">{questions.length}</div>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border">
                <div className="text-muted text-xs uppercase tracking-wider mb-1">XP Earned</div>
                <div className="text-2xl font-bold text-primary">+{score}</div>
            </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={`/modules/${id}/essays`} className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-background transition-all hover:bg-primary-dim">Continue to written responses</Link>
          <button onClick={() => router.push("/modules")} className="w-full rounded-xl bg-surface-light py-3 font-bold text-foreground transition-all hover:bg-surface">Return to modules</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const progressPercent = ((currentQIndex) / questions.length) * 100;
  const currentAnswer = answersMap[currentQ.id];

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4">
      
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-foreground flex items-center gap-3"><span className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-mono border border-primary/20">M-{id}</span> Active Mission</h1></div>
        <div className="hidden md:flex items-center gap-2 text-muted text-sm"><AlertCircle size={16} /> <span>MCQ Protocol</span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface/80 border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-surface-light"><div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }}></div></div>

                <div className="mt-4 mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-muted text-sm font-mono">QUERY_ID_{currentQIndex + 1}</span>
                        <span className="text-primary text-sm font-bold">2 XP</span>
                    </div>
                    <h2 className="mb-6 whitespace-pre-wrap text-xl font-medium leading-relaxed text-foreground">{currentQ.text}</h2>
                    {currentQ.stimulus_code && <PythonCodeBlock code={currentQ.stimulus_code} />}
                    {currentQ.stimulus_asset_url && <figure className="my-6 overflow-hidden rounded-xl border border-border bg-background p-3"><Image unoptimized width={1200} height={800} src={currentQ.stimulus_asset_url} alt={currentQ.stimulus_asset_alt || currentQ.text} className="mx-auto h-auto max-h-[32rem] w-full object-contain" priority /><figcaption className="mt-2 text-center text-xs text-muted">Lesson visual</figcaption></figure>}
                    {currentQ.stimulus_code && (<div className="mt-8 border-t border-border/50 pt-6"><div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Terminal size={12} /> Optional Python sandbox</span><span className="text-[10px] text-muted">Runs in this browser</span></div><PythonPlayground initialCode={currentQ.stimulus_code} /></div>)}
                </div>

                <div className="space-y-3">
                    {currentQ.QuestionOption.map((opt) => {
                        const optionFeedback = feedback?.optionFeedback.find((item) => item.optionId === opt.id);
                        let borderClass = "border-border hover:border-surface-light", bgClass = "bg-surface/30", textClass = "text-muted", Icon = null;
                        if (showFeedback) {
                            if (feedback?.correctOptionId === opt.id || (selectedOption === opt.id && currentAnswer?.is_correct)) { borderClass = "border-success/50"; bgClass = "bg-success/10"; textClass = "text-success"; Icon = <CheckCircle className="text-success" size={20} />; }
                            else if (selectedOption === opt.id) { borderClass = "border-danger/50"; bgClass = "bg-danger/10"; textClass = "text-danger"; Icon = <XCircle className="text-danger" size={20} />; }
                            else { bgClass = "opacity-50"; }
                        } else if (selectedOption === opt.id) { 
                            borderClass = "border-primary"; bgClass = "bg-primary/10"; textClass = "text-foreground"; Icon = <CheckCircle className="text-primary" size={20} />; 
                        }

                        return (
                            <div key={opt.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${borderClass} ${bgClass}`}>
                                <button onClick={() => !isLocked && setSelectedOption(opt.id)} disabled={isLocked || isSubmitting} className={clsx("w-full text-left p-4 flex justify-between items-center", isLocked ? "cursor-default" : "cursor-pointer")}>
                                    <span className={`font-medium ${textClass}`}>{opt.text}</span>{Icon}
                                </button>
                                {showFeedback && optionFeedback?.justification && <div className="border-t border-border/50 px-4 py-3 text-sm leading-6 text-muted"><span className={clsx("mr-2 text-xs font-bold uppercase tracking-wider", optionFeedback.isCorrect ? "text-success" : "text-primary")}>{optionFeedback.isCorrect ? "Why this is correct" : "Why this choice is incorrect"}</span>{optionFeedback.justification}</div>}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 flex justify-between items-center pt-4 border-t border-border/50">
                    <ReportButton questionId={currentQ.id} studentId={studentDbId!} seasonId={activeSeasonId!} />
                    {!isLocked ? (
                        <button onClick={handleSubmit} disabled={!selectedOption || isSubmitting} className={clsx("px-8 py-3 rounded-xl font-bold flex items-center transition-all", !selectedOption || isSubmitting ? "bg-surface-light text-muted cursor-not-allowed" : "bg-primary hover:bg-primary-dim text-background shadow-lg shadow-primary/20")}>
                            {isSubmitting ? "Processing..." : <>CONFIRM ENTRY <ArrowRight className="ml-2 w-4 h-4" /></>}
                        </button>
                    ) : (
                        <button onClick={handleNext} className="px-8 py-3 rounded-xl font-bold flex items-center transition-all bg-success hover:bg-success/80 text-slate-950 shadow-lg shadow-success/20 animate-in fade-in">
                            {currentQIndex < questions.length - 1 ? "NEXT INTEL" : "FINISH MISSION"} <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Right Col: Stats & Map */}
        <div className="space-y-6">
            <div className="bg-surface/50 border border-border rounded-2xl p-6">
                <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-4">Session Stats</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                        <div className="flex items-center gap-3"><div className="p-2 bg-warning/10 rounded-lg text-warning"><Zap size={18} /></div><div><div className="text-xs text-muted">Current Score</div><div className="text-lg font-bold text-foreground">{score} XP</div></div></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                        <div className="flex items-center gap-3"><div className="p-2 bg-success/10 rounded-lg text-success"><Target size={18} /></div><div><div className="text-xs text-muted">Remaining</div><div className="text-lg font-bold text-foreground">{questions.length - currentQIndex} Qs</div></div></div>
                    </div>
                </div>
            </div>

            <div className="bg-surface/50 border border-border rounded-2xl p-6 hidden lg:block">
                <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-4">Question Map</h3>
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        let mapClass = "bg-surface border-border text-muted hover:bg-surface-light hover:text-foreground cursor-pointer"; 
                        const ans = answersMap[q.id];
                        
                        if (idx === currentQIndex) {
                            mapClass = "bg-primary/20 border-primary text-primary animate-pulse cursor-default";
                        } else if (ans) {
                            mapClass = ans.is_correct 
                                ? "bg-success/20 border-success text-success" 
                                : "bg-danger/20 border-danger text-danger";
                        }

                        return (
                            <button 
                                key={idx} 
                                onClick={() => jumpToQuestion(idx)}
                                className={clsx("h-10 rounded-lg flex items-center justify-center text-xs font-bold border transition-all", mapClass)}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
