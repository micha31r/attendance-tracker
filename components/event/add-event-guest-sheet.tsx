import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Member, mergeMemberData } from "@/lib/data/member"
import { Event, getEventById, updateEventAttendeeData } from "@/lib/data/event"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export function AddEventGuestSheet({ trigger }: { trigger: React.ReactNode }) {
  const [disabled, setDisabled] = useState(false)
  const { eventId }: { eventId: string } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  })
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDisabled(true)

    if (!event) {
      console.error("Event is not set")
      setDisabled(false)
      return
    }

    const mergedMembers = mergeMemberData([values], (event.attendee_data || []) as Member[])
    const data = await updateEventAttendeeData(eventId, mergedMembers)
    if (!data) {
      console.error("Failed to update event attendees")
      setDisabled(false)
    }

    closeButtonRef.current?.click()
    window.location.reload()
  }

  useEffect(() => {
    (async () => {
      if (!eventId) {
        console.error("Event ID is not available")
        router.push("/org")
        return
      }

      const event = await getEventById(eventId)
      if (!event) {
        console.error("Event not found")
        router.push("/org")
        return
      }

      setEvent(event)
    })()
  }, [])

  if (!event) {
    return null
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add guest attendee</SheetTitle>
          <SheetDescription>
            Add expected attendees to the event &quot;{event.name}&quot;.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <Form {...form}>
            <form id="add-event-member-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <SheetFooter>
           <Button type="submit" form="add-event-member-form" disabled={disabled}>Add guest attendee</Button>
          <SheetClose asChild ref={closeButtonRef}>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
