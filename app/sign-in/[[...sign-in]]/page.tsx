import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/custom/AuthShell";

export default function SignInPage() {
  return (
    <AuthShell title="Your agents kept working. Come see what they did." subtitle="welcome back">
      <SignIn />
    </AuthShell>
  );
}
