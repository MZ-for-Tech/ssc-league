import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Sign In",
  "Sign in to continue your programming and data science season with SSC2 League.",
);

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
