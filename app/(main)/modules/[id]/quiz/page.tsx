"use client";

import { useEffect, useState, use } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, Trophy, Loader2, Zap, Target, AlertCircle, Terminal, XCircle, HelpCircle, Lock } from "lucide-react";
import clsx from "clsx";
import PythonCodeBlock from "@/components/PythonCodeBlock";
import PythonPlayground from "@/components/PythonPlayground";
import ReportButton from "@/components/ReportButton";

// --- TYPES ---
type Option = { 
  id: string; 
  text: string; 
  is_correct: boolean;
  justification?: string; 
};
type Question = { id: string; text: string; points: number; QuestionOption: Option[] };

type AnswerRecord = {
    question_id: string;
    selected_option_id: string;
    is_correct: boolean;
};

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const router = useRouter();
  
  // State
  const [studentDbId, setStudentDbId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, AnswerRecord>>({}); // <--- NEW: Store answers
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [quizState, setQuizState] = useState<"loading" | "active" | "finished">("loading");
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // <--- NEW: Is current Q locked?

  // 1. Initialization
  useEffect(() => {
    const initPage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Get Student ID
      const { data: studentData } = await supabase
        .from("Student")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!studentData) return;
      setStudentDbId(studentData.id);

      // Fetch Questions
      const { data: quizData } = await supabase
        .from("Question")
        .select(`id, text, points, QuestionOption (id, text, is_correct, justification)`)
        .eq("topic_id", id);

      if (!quizData) return;
      const typedQuestions = quizData as unknown as Question[];
      setQuestions(typedQuestions);
      setTotalPoints(typedQuestions.reduce((acc, curr) => acc + curr.points, 0));

      // --- NEW: FETCH PREVIOUS ANSWERS ---
      const { data: existingAnswers } = await supabase
        .from("StudentAnswer")
        .select("question_id, selected_option_id, is_correct")
        .eq("student_id", studentData.id)
        .in("question_id", typedQuestions.map(q => q.id));

      // Map answers for easy lookup
      const loadedAnswers: Record<string, AnswerRecord> = {};
      let initialScore = 0;
      
      existingAnswers?.forEach((ans: any) => {
          loadedAnswers[ans.question_id] = ans;
          // Recalculate score based on new rules (2 for correct, 1 for wrong)
          if (ans.is_correct) initialScore += 2;
          else initialScore += 1;
      });

      setAnswersMap(loadedAnswers);
      setScore(initialScore);

      // Check if FIRST question is already answered
      if (typedQuestions.length > 0) {
          const firstQ = typedQuestions[0];
          if (loadedAnswers[firstQ.id]) {
              setSelectedOption(loadedAnswers[firstQ.id].selected_option_id);
              setShowFeedback(true);
              setIsLocked(true);
          }
      }

      setQuizState("active");
    };

    initPage();
  }, [id, supabase, router]);

  // 2. Navigation Handler (Next Question)
  const handleNext = () => {
    const nextIndex = currentQIndex + 1;
    
    if (nextIndex < questions.length) {
        const nextQ = questions[nextIndex];
        const existingAns = answersMap[nextQ.id];

        if (existingAns) {
            // If next question is already answered -> Lock it and show result
            setSelectedOption(existingAns.selected_option_id);
            setShowFeedback(true);
            setIsLocked(true);
        } else {
            // If next question is new -> Reset state
            setSelectedOption(null);
            setShowFeedback(false);
            setIsLocked(false);
        }
        setCurrentQIndex(nextIndex);
    } else {
        setQuizState("finished");
    }
  };

  // 3. Submission Handler (New Answers Only)
  const handleSubmit = async () => {
    if (!selectedOption || !studentDbId || isLocked) return; // Prevent submitting if locked
    setIsSubmitting(true);

    const currentQ = questions[currentQIndex];
    const chosenOption = currentQ.QuestionOption.find(o => o.id === selectedOption);
    const isCorrect = chosenOption?.is_correct || false;

    // Optimistic Score Update
    // Rule: 2 XP if Correct, 1 XP if Wrong
    setScore((prev) => prev + (isCorrect ? 2 : 1));

    // Save to DB
    await supabase.from("StudentAnswer").upsert({
        student_id: studentDbId,
        question_id: currentQ.id,
        selected_option_id: selectedOption,
        is_correct: isCorrect,
        attempted_at: new Date().toISOString()
    }, { onConflict: 'student_id, question_id' });

    // Update Local Map so it stays locked if they come back
    setAnswersMap(prev => ({
        ...prev,
        [currentQ.id]: { question_id: currentQ.id, selected_option_id: selectedOption, is_correct: isCorrect }
    }));

    setIsSubmitting(false);
    setShowFeedback(true);
    setIsLocked(true); // Lock immediately after submitting
  };


  if (quizState === "loading") return <div className="flex h-[50vh] items-center justify-center text-primary"><Loader2 className="animate-spin w-10 h-10" /></div>;
  
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
        <button onClick={() => router.push("/modules")} className="w-full py-3 bg-surface-light hover:bg-surface text-foreground rounded-xl font-bold transition-all">Return to Base</button>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];
  const progressPercent = ((currentQIndex) / questions.length) * 100;
  const isCodeQuestion = currentQ.text.includes("(") || currentQ.text.includes("=") || currentQ.text.includes("def ") || currentQ.text.includes("print");

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      
      {/* Header */}
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
                        {/* Updated to show the new potential points (2 XP) */}
                        <span className="text-primary text-sm font-bold">2 XP</span>
                    </div>
                    
                    {/* Question Content */}
                    {isCodeQuestion ? (<div className="mb-6"><div className="text-muted mb-2 text-sm uppercase tracking-wider font-bold">Analyze Syntax:</div><PythonCodeBlock code={currentQ.text} /></div>) : (<h2 className="text-xl md:text-2xl font-medium text-foreground mb-8 leading-relaxed">{currentQ.text}</h2>)}
                    {isCodeQuestion && (<div className="mt-8 pt-6 border-t border-border/50"><div className="flex items-center justify-between mb-3"><span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2"><Terminal size={12} /> Live Verification</span><span className="text-[10px] text-muted">Pyodide Environment</span></div><PythonPlayground initialCode="# Use this space to test the code above..." /></div>)}
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {currentQ.QuestionOption.map((opt) => {
                        let borderClass = "border-border hover:border-surface-light", bgClass = "bg-surface/30", textClass = "text-muted", Icon = null;
                        
                        if (showFeedback) {
                            // FEEDBACK MODE (Visuals)
                            if (opt.is_correct) { 
                                borderClass = "border-success/50"; bgClass = "bg-success/10"; textClass = "text-success"; Icon = <CheckCircle className="text-success" size={20} />; 
                            } else if (selectedOption === opt.id && !opt.is_correct) { 
                                borderClass = "border-danger/50"; bgClass = "bg-danger/10"; textClass = "text-danger"; Icon = <XCircle className="text-danger" size={20} />; 
                            } else { 
                                bgClass = "opacity-50"; 
                            }
                        } else if (selectedOption === opt.id) { 
                            // SELECTION MODE
                            borderClass = "border-primary"; bgClass = "bg-primary/10"; textClass = "text-foreground"; Icon = <CheckCircle className="text-primary" size={20} />; 
                        }

                        return (
                            <div key={opt.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${borderClass} ${bgClass}`}>
                                <button 
                                    onClick={() => !isLocked && setSelectedOption(opt.id)} 
                                    disabled={isLocked || isSubmitting} 
                                    className={clsx("w-full text-left p-4 flex justify-between items-center", isLocked ? "cursor-default" : "cursor-pointer")}
                                >
                                    <span className={`font-medium ${textClass}`}>{opt.text}</span>{Icon}
                                </button>
                                {showFeedback && opt.justification && (<div className={clsx("px-4 pb-4 text-sm animate-in slide-in-from-top-2", opt.is_correct ? "text-success/80" : "text-muted")}><div className="h-px w-full bg-current opacity-10 mb-2" /><p className="flex gap-2"><HelpCircle size={14} className="mt-0.5 shrink-0" />{opt.justification}</p></div>)}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex justify-between items-center pt-4 border-t border-border/50">
                    <ReportButton questionId={currentQ.id} studentId={studentDbId!} />

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

            {/* Question Map (Visual History) */}
            <div className="bg-surface/50 border border-border rounded-2xl p-6 hidden lg:block">
                <h3 className="text-muted text-xs font-bold uppercase tracking-widest mb-4">Question Map</h3>
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        // Determine Color based on Answer Status
                        let mapClass = "bg-surface border-border text-muted"; // Default: Unanswered
                        const ans = answersMap[q.id];
                        
                        if (idx === currentQIndex) {
                            mapClass = "bg-primary/20 border-primary text-primary animate-pulse"; // Current
                        } else if (ans) {
                            mapClass = ans.is_correct 
                                ? "bg-success/20 border-success text-success" // Correct (Green)
                                : "bg-danger/20 border-danger text-danger";   // Wrong (Red)
                        }

                        return (
                            <div key={idx} className={clsx("h-10 rounded-lg flex items-center justify-center text-xs font-bold border transition-all", mapClass)}>
                                {idx + 1}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}