import ForgotPasswordForm from "./ForgotPasswordForm";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error } = await searchParams;

  return <ForgotPasswordForm linkError={Boolean(error)} />;
}
