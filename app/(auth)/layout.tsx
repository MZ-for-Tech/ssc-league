import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Account Recovery",
  "Sign in or recover access to your SSC2 League account.",
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
