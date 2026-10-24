import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/custom/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell title="Hire your first agent. It starts tonight." subtitle="create your console">
      <SignUp />
    </AuthShell>
  );
}
