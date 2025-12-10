import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. CHECK ADMIN TABLE
  const { data: adminProfile, error } = await supabase
    .from("Admin")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (!adminProfile || error) {
    return (
        <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-red-500/30 p-8 rounded-2xl text-center shadow-2xl">
                <div className="text-red-500 font-mono text-xl font-bold mb-4 uppercase tracking-widest border-b border-red-500/20 pb-4">
                    Security Violation
                </div>
                <p className="text-slate-400 mb-6">
                    Identity confirmed, but clearance level is insufficient for Command Access.
                </p>
                <div className="bg-black/30 p-4 rounded-lg font-mono text-xs text-slate-500 break-all mb-6">
                    ID: {user.id}
                </div>
                <a href="/dashboard" className="inline-block px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg text-sm font-bold uppercase tracking-wider transition-all">
                    Return to Field
                </a>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-rose-500/30 selection:text-rose-200">
        <AdminSidebar />
        
        {/* Main Content Area - Shifted by Sidebar Width logic is handled via CSS grid/flex or padding strategies in modern CSS, 
            but here we rely on the sidebar being fixed and us adding left margin.
            Since Sidebar is client-side dynamic width, we use a safe margin for the 'expanded' state on desktop 
            or use a wrapper. A simple approach for this setup: */}
        <div className="md:pl-20 lg:pl-64 transition-[padding] duration-300"> 
            <main className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
                {children}
            </main>
        </div>
    </div>
  );
}