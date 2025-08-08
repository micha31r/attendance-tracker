'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteEvent } from "@/lib/data/event"
import { useRef, useState } from "react"

export function DeleteEventDialog({ name, id, trigger }: { name: string, id: string, trigger: React.ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [disabled, setDisabled] = useState(false)

  async function onSubmit() {
    setDisabled(true)
    if (!inputRef.current) {
      console.error("Input reference is not set.")
      return
    }

    if (inputRef.current.value !== name) {
      alert("Event name does not match. Please try again.")
      setDisabled(false)
      return
    }

    const success = await deleteEvent(id)

    if (success) {
      window.location.reload()
    } else {
      alert("Failed to delete the event. Please try again later.")
    }
  }

  return (
    <Dialog>
      <div>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? 
            </DialogDescription>
          </DialogHeader>
          <div>
            <p className="text-sm mb-1">Enter the event name to confirm deletion:</p>
            <p className="text-md text-primary pointer-events-none select-none">{name}</p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Event name</Label>
              <Input ref={inputRef} id="name-1" name="name" autoComplete="off" placeholder="Event name" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={onSubmit} disabled={disabled}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  )
}
