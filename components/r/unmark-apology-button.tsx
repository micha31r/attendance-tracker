"use client";
import { unmarkApology, unmarkApologyAnon } from "@/lib/data/attendance";
import { Button } from "../ui/button";
import { useState } from "react";

export default function UnmarkApologyButton({ eventId, email, isAuthenticated }: { eventId: string, email: string, isAuthenticated: boolean }) {
  const [disabled, setDisabled] = useState(false);

  const dataFunction = isAuthenticated ? unmarkApology : unmarkApologyAnon

  async function handleClick() {
    setDisabled(true);

    const data = await dataFunction(eventId, email);
    if (!data) {
      console.error("Failed to unmark apology");
      setDisabled(false);
      return;
    }

    window.location.reload();
  }

  return (
    <Button onClick={handleClick} variant={"ghost"} className="bg-background hover:bg-background/90! text-foreground my-auto w-max" disabled={disabled}>Withdraw apology</Button>
  );
}