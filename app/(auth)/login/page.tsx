"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import SidebarLogo from "@/components/Logo"; 

export default function LoginPage() {
  const [input, setInput] = useState(""); // Can be ID or Email
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let loginEmail = input; // Default to input

      // 1. "Smart Login" Check (Is it a Student ID?)
      const isStudentId = /^\d+$/.test(input);

      if (isStudentId) {
          // Lookup email via RPC (Student flow)
          const { data: realEmail, error: lookupError } = await supabase
            .rpc('get_email_by_student_id', { lookup_id: input });

          if (lookupError || !realEmail) throw new Error("Student ID not found.");
          loginEmail = realEmail;
      }

      // 2. Perform Login
      const { error: authError, data: authData } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) throw authError;

      // 3. ROUTING LOGIC (The Fix)
      // Check if this user is an Admin
      const { data: adminProfile } = await supabase
        .from("Admin")
        .select("id")
        .eq("auth_id", authData.user.id)
        .single();

      if (adminProfile) {
          // IS ADMIN -> Go to Command Center
          router.refresh();
          router.push("/admin");
      } else {
          // IS STUDENT -> Go to Dashboard
          router.refresh();
          router.push("/dashboard");
      }

    } catch (err: any) {
      if (err.message.includes("Invalid login")) {
          setError("Access Denied: Incorrect Password.");
      } else {
          setError(err.message || "System Error.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-dim/10 rounded-full blur-[100px] opacity-50" />
        <div 
          className="absolute inset-0 opacity-[0.1]" 
          style={{ backgroundImage: `radial-gradient(rgb(var(--muted)) 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-8">
            <div className="scale-125 origin-bottom">
               <SidebarLogo />
            </div>
        </div>

        <div className="bg-surface/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back, Agent</h1>
                <p className="text-muted text-sm">Enter your credentials to access the network.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                
                {/* ID / Email Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">
                        Student ID <span className="text-muted/50 lowercase font-normal">(or Email)</span>
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-muted group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full bg-surface/50 border border-surface-light text-foreground rounded-xl py-3 pl-10 focus:ring-2 focus:ring-primary/50 focus:border-primary block transition-all placeholder:text-muted/50"
                            placeholder="e.g. 5240103"
                            required
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">
                        Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-muted group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-surface/50 border border-surface-light text-foreground rounded-xl py-3 pl-10 focus:ring-2 focus:ring-primary/50 focus:border-primary block transition-all placeholder:text-muted/50"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-center gap-3"
                    >
                        <div className="p-1 bg-danger/20 rounded-full">
                            <ShieldCheck className="w-4 h-4 text-danger" />
                        </div>
                        <span className="text-sm text-danger font-medium">{error}</span>
                    </motion.div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-dim to-primary hover:brightness-110 text-background font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Authenticating...</span>
                        </>
                    ) : (
                        <>
                            <span>Access System</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-xs text-muted">
                    Restricted Access. Unauthorized entry will be logged.
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}