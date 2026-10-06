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
    <div className="p-3 border-t border-border bg-surface/30 flex flex-col gap-2">
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        title="Disconnect"
        className={clsx(
          "flex items-center rounded-xl transition-all group border border-transparent hover:border-danger/20 text-muted hover:text-danger hover:bg-danger/10",
          isCollapsed ? "justify-center p-3" : "w-full px-4 py-3",
        )}
      >
        {isSigningOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} className={clsx(!isCollapsed && "mr-3")} />}
        {!isCollapsed && <span className="text-sm font-medium">{isSigningOut ? "..." : "Disconnect"}</span>}
      </button>
      {!isCollapsed && (
        <div className="mt-2 flex items-center justify-between px-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="text-xs text-slate-600 font-mono uppercase">v1.0.0 Stable</span>
        </div>
      )}
    </div>
  );
}
