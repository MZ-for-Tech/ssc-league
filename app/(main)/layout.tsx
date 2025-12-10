import React from "react";
import { cookies } from "next/headers";
import MainLayoutShell from "@/components/MainLayoutShell";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  
  // Check if the secure cookie exists
  const isImpersonating = cookieStore.has("impersonate_id");

  return (
    <MainLayoutShell isImpersonating={isImpersonating}>
      {children}
    </MainLayoutShell>
  );
}