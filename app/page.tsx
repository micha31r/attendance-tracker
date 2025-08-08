import HalfToneGradient from "@/components/half-tone-gradient";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-svh flex flex-col items-center justify-center relative">
      <HalfToneGradient className="absolute inset-0" />
      
      <div className="relative z-10 text-center flex gap-8 flex-col items-center px-4">
        <h1 className="text-3xl sm:text-5xl max-w-lg sm:max-w-2xl">
          Effortless attendance tracking across meetings and teams.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-80 sm:max-w-lg">
          Import users and set up teams in seconds. Collect attendance securely with a single, verified link.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="p-8 py-6 rounded-full font-semibold text-md shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
            <Link href="/auth/login">Get started for free</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
