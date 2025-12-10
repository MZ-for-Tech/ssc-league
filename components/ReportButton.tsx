"use client";

import React, { useState } from "react";
import { Flag, X, Check } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import clsx from "clsx";

export default function ReportButton({ questionId, studentId }: { questionId: string, studentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleReport = async () => {
    if (!reason) return;
    setLoading(true);
    
    await supabase.from("QuestionReport").insert({
        question_id: questionId,
        student_id: studentId,
        reason: reason
    });

    setLoading(false);
    setSubmitted(true);
    setTimeout(() => { setIsOpen(false); setSubmitted(false); setReason(""); }, 2000);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors mt-4"
      >
        <Flag size={12} /> Report Issue
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Flag size={18} className="text-rose-500" /> Report Anomaly
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {!submitted ? (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                            Is there an error in this question? Describe the issue for Command to review.
                        </p>
                        
                        <div className="space-y-2">
                            {['Typo / Grammar', 'Wrong Answer Key', 'Code Not Running', 'Confusing Wording'].map((opt) => (
                                <button 
                                    key={opt}
                                    onClick={() => setReason(opt)}
                                    className={clsx(
                                        "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                                        reason === opt 
                                            ? "bg-rose-500/10 border-rose-500 text-rose-400" 
                                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"
                                    )}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleReport}
                            disabled={!reason || loading}
                            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl mt-2 disabled:opacity-50 flex justify-center"
                        >
                            {loading ? "Transmitting..." : "Submit Report"}
                        </button>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                            <Check size={24} />
                        </div>
                        <h4 className="text-white font-bold">Report Logged</h4>
                        <p className="text-slate-500 text-sm">Thank you, Agent.</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </>
  );
}