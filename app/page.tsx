import HalfToneGradient from "@/components/half-tone-gradient";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative">
      <HalfToneGradient className="absolute inset-0" />
      
      <div className="relative z-10 text-center flex gap-8 flex-col items-center px-4">
        <h1 className="text-5xl max-w-2xl">
          Effortless attendance across meetings and teams.
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg">
          Import users and set up teams in seconds. Collect attendance securely with a single, verified link.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="p-8 py-5 rounded-full" variant={"ghost"}>
            <Link href="">See how it works</Link>
          </Button>
          <Button asChild className="p-8 py-5 rounded-full">
            <Link href="/auth/login">Get started for free</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
