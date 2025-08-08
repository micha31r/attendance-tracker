"use client"
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function CopyButton({ className, text, ...props }: { className?: string; text: string }) {
  return (
    <Button onClick={() => navigator.clipboard.writeText(text)} variant={"outline"} size="sm" {...props} className={cn(className)}>Copy</Button>
  );
}