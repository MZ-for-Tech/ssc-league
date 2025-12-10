"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Save, Plus, Trash2, FileText, Upload, AlertCircle, CheckCircle, HelpCircle, Target, List } from "lucide-react";
import clsx from "clsx";

export default function QuestionBuilderPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [topics, setTopics] = useState<any[]>([]);
  
  // Single Mode State
  const [selectedTopic, setSelectedTopic] = useState("");
  const [points, setPoints] = useState(10);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { text: "", is_correct: true, justification: "" },
    { text: "", is_correct: false, justification: "" },
    { text: "", is_correct: false, justification: "" },
    { text: "", is_correct: false, justification: "" },
  ]);

  // Bulk Mode State
  const [bulkData, setBulkData] = useState("");
  const [bulkStatus, setBulkStatus] = useState<{msg: string, type: 'success'|'error'|'neutral'} | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
        const { data } = await supabase.from("Topic").select("id, name, week_number").order("week_number");
        if (data) setTopics(data);
    };
    load();
  }, []);

  // --- SINGLE SUBMIT ---
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return alert("Select a topic");
    setIsSubmitting(true);

    try {
        const { data: qData, error: qError } = await supabase
            .from("Question")
            .insert({ text: questionText, topic_id: selectedTopic, points })
            .select()
            .single();

        if (qError) throw qError;

        const formattedOptions = options.map(o => ({
            question_id: qData.id,
            text: o.text,
            is_correct: o.is_correct,
            justification: o.justification
        }));

        const { error: oError } = await supabase.from("Option").insert(formattedOptions);
        if (oError) throw oError;

        alert("Mission Added Successfully");
        setQuestionText("");
        setOptions(options.map(o => ({ ...o, text: "", justification: "" })));
    } catch (err: any) {
        alert("Error: " + err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- BULK SUBMIT ---
  const handleBulkSubmit = async () => {
      setIsSubmitting(true);
      setBulkStatus({ msg: "Parsing and Uploading...", type: "neutral" });
      
      try {
          const rows = bulkData.trim().split('\n');
          let successCount = 0;

          for (const row of rows) {
              const cols = row.split('|').map(c => c.trim());
              if (cols.length < 7) continue; 

              const [tName, qText, o1, o2, o3, o4, correctIdx, pts] = cols;
              
              const topic = topics.find(t => t.name.toLowerCase() === tName.toLowerCase());
              if (!topic) {
                  console.warn(`Topic not found: ${tName}`);
                  continue;
              }

              const { data: qData, error: qError } = await supabase
                .from("Question")
                .insert({ text: qText, topic_id: topic.id, points: parseInt(pts) || 10 })
                .select()
                .single();
              
              if (qError) continue;

              const opts = [o1, o2, o3, o4].map((txt, idx) => ({
                  question_id: qData.id,
                  text: txt,
                  is_correct: (parseInt(correctIdx) === idx + 1),
                  justification: "" 
              }));

              await supabase.from("Option").insert(opts);
              successCount++;
          }

          setBulkStatus({ msg: `Successfully uploaded ${successCount} missions.`, type: "success" });
          setBulkData("");
      } catch (e: any) {
          setBulkStatus({ msg: "Error: " + e.message, type: "error" });
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
        <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <FileText className="text-purple-400" /> Mission Armory
            </h1>
            <p className="text-slate-400 text-sm mt-1">Construct tactical assessments and challenges.</p>
        </div>
        
        {/* Mode Toggle */}
        <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1">
            <button 
                onClick={() => setMode("single")}
                className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all", mode === "single" ? "bg-purple-500/20 text-purple-400 border border-purple-500/50" : "text-slate-500 hover:text-white")}
            >
                <Target size={14} /> Visual
            </button>
            <button 
                onClick={() => setMode("bulk")}
                className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all", mode === "bulk" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" : "text-slate-500 hover:text-white")}
            >
                <List size={14} /> Batch Import
            </button>
        </div>
      </div>

      {mode === "single" ? (
          /* --- SINGLE BUILDER --- */
          <form onSubmit={handleSingleSubmit} className="space-y-6">
             
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Question Editor */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={14} /> Mission Briefing (Question)
                        </label>
                        <textarea 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-purple-500 outline-none min-h-[150px] text-sm leading-relaxed placeholder:text-slate-600"
                            placeholder="Enter the tactical scenario description..."
                            value={questionText}
                            onChange={e => setQuestionText(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <List size={14} /> Tactical Options
                        </label>
                        <div className="grid grid-cols-1 gap-4">
                            {options.map((opt, idx) => (
                                <div key={idx} className={clsx("flex items-start gap-4 p-4 rounded-xl border transition-all", opt.is_correct ? "bg-emerald-500/5 border-emerald-500/50" : "bg-slate-950/30 border-slate-800")}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newOpts = [...options];
                                            newOpts.forEach(o => o.is_correct = false);
                                            newOpts[idx].is_correct = true;
                                            setOptions(newOpts);
                                        }}
                                        className={clsx("mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors", opt.is_correct ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-600 text-transparent hover:border-slate-400")}
                                    >
                                        <CheckCircle size={12} fill="currentColor" />
                                    </button>
                                    
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={clsx("text-xs font-mono font-bold", opt.is_correct ? "text-emerald-400" : "text-slate-500")}>OPTION {String.fromCharCode(65 + idx)}</span>
                                        </div>
                                        <input 
                                            type="text"
                                            placeholder={`Enter Answer Choice ${idx + 1}`}
                                            className="w-full bg-transparent border-b border-slate-700/50 pb-1 text-sm text-white focus:border-white focus:outline-none placeholder:text-slate-600"
                                            value={opt.text}
                                            onChange={e => {
                                                const newOpts = [...options];
                                                newOpts[idx].text = e.target.value;
                                                setOptions(newOpts);
                                            }}
                                            required
                                        />
                                        <input 
                                            type="text"
                                            placeholder="Debrief (Explanation for why this is correct/incorrect)"
                                            className="w-full bg-slate-900/50 rounded px-3 py-2 text-xs text-slate-400 focus:text-white outline-none border border-transparent focus:border-slate-700 transition-colors"
                                            value={opt.justification}
                                            onChange={e => {
                                                const newOpts = [...options];
                                                newOpts[idx].justification = e.target.value;
                                                setOptions(newOpts);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Configuration Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Target size={16} /> Configuration
                        </h3>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Target Module</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-purple-500 outline-none text-sm appearance-none"
                                    value={selectedTopic}
                                    onChange={e => setSelectedTopic(e.target.value)}
                                    required
                                >
                                    <option value="">Select Topic...</option>
                                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <List size={14} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">XP Value</label>
                            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-3">
                                <span className="text-xs font-bold text-yellow-500">XP</span>
                                <input 
                                    type="number" 
                                    className="bg-transparent text-right w-full text-white font-mono font-bold outline-none"
                                    value={points}
                                    onChange={e => setPoints(parseInt(e.target.value))} 
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                            >
                                {isSubmitting ? "Deploying..." : <><Save size={18} /> Deploy Mission</>}
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          </form>
      ) : (
          /* --- BULK IMPORTER --- */
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <HelpCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                      <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Syntax Guide</h3>
                      <code className="block bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-400 overflow-x-auto border border-slate-800">
                          TopicName | Question | Option A | Option B | Option C | Option D | CorrectIndex(1-4) | XP
                      </code>
                      <p className="text-xs text-slate-500">
                          Example: <span className="font-mono text-emerald-400">Python Basics | What is len('Hi')? | 1 | 2 | 3 | 0 | 2 | 10</span>
                      </p>
                  </div>
              </div>

              <textarea 
                  className="w-full h-96 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 focus:border-cyan-500 outline-none leading-relaxed resize-none"
                  placeholder="Paste CSV data here..."
                  value={bulkData}
                  onChange={e => setBulkData(e.target.value)}
              />

              {bulkStatus && (
                  <div className={clsx("p-4 rounded-xl flex items-center gap-3 text-sm font-bold", 
                      bulkStatus.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                      bulkStatus.type === 'error' ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : 
                      "bg-slate-800 text-slate-400"
                  )}>
                      {bulkStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                      {bulkStatus.msg}
                  </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-800">
                  <button 
                      onClick={handleBulkSubmit}
                      disabled={isSubmitting || !bulkData}
                      className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:grayscale"
                  >
                      {isSubmitting ? "Processing..." : <><Upload size={18} /> Execute Batch Upload</>}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
}