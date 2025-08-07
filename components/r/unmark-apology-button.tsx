"use client";
import { unmarkApology } from "@/lib/data/attendance";
import { Button } from "../ui/button";
import { useState } from "react";

export default function UnmarkApologyButton({ eventId, email }: { eventId: string, email: string }) {
  const [disabled, setDisabled] = useState(false);

  async function handleClick() {
    setDisabled(true);

    const data = await unmarkApology(eventId, email);
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