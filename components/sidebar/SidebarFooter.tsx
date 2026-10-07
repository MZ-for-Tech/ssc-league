"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import clsx from "clsx";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { clearImpersonationCookie } from "@/app/actions/admin-impersonation";

type SidebarFooterProps = { isCollapsed: boolean };

export default function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      try {
        await clearImpersonationCookie();
      } catch (error) {
        console.error("Error clearing impersonation state:", error);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/30 p-3">
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        title="Disconnect"
        className={clsx(
          "flex items-center rounded-xl transition-all group border border-transparent hover:border-danger/20 text-muted hover:text-danger hover:bg-danger/10",
          isCollapsed ? "justify-center p-3" : "min-w-0 flex-1 px-2 py-2.5",
        )}
      >
        {isSigningOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} className={clsx(!isCollapsed && "mr-3")} />}
        {!isCollapsed && <span className="text-sm font-medium">{isSigningOut ? "..." : "Disconnect"}</span>}
      </button>
      {!isCollapsed && (
        <div className="shrink-0 animate-in fade-in slide-in-from-bottom-2">
          <span className="whitespace-nowrap font-mono text-[10px] uppercase text-slate-600 sm:text-xs">v1.0.0 Stable</span>
        </div>
      )}
    </div>
  );
}
