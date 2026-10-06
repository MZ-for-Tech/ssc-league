"use client";

import { Key, RotateCcw } from "lucide-react";

export function EditUserSecurityTab({
  status,
  loading,
  onResetPassword,
}: {
  status: { type: "success" | "error"; msg: string } | null;
  loading: boolean;
  onResetPassword: () => void;
}) {
  return (
    <div className="space-y-8 text-center py-4">
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                            <Key size={32} className="text-rose-500" />
                        </div>
                        <h4 className="text-white font-bold text-lg">Credential Reset Protocol</h4>
                        <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                            This action generates a random temporary password. It will appear here after reset:
                        </p>
                        <code className="mt-4 block bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-cyan-400 font-mono text-sm">
                            {status?.type === "success" && status.msg.startsWith("Temporary password:")
                              ? status.msg.replace("Temporary password: ", "")
                              : "Shown once after reset"}
                        </code>
                    </div>
                    
                    <div className="space-y-3 border-t border-slate-800 pt-6">
                        <button 
                            onClick={onResetPassword}
                            disabled={loading}
                            className="w-full py-3 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700 hover:border-transparent group"
                        >
                            <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" /> 
                            Reset Password
                        </button>
                        <p className="text-xs text-slate-500">
                            Action logged in Admin Audit Trail.
                        </p>
                    </div>
                </div>
  );
}
