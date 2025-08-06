"use client"
import { ShareIcon } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export function ShareLinkButton({ className, link }: { className?: string, link: string }) {
  return (
    <Button
      variant={"outline"}
      className={cn("my-auto", className)}
      onClick={() => navigator.clipboard.writeText(link)}
    >
      <ShareIcon /> Copy link
    </Button>
  )
}