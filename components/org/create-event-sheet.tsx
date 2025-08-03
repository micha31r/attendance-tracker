import { useState } from "react"
import { useRouter } from "next/navigation"
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

import { createEvent } from "@/lib/data/event"
import { DatetimePicker } from "./datetime-picker"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Event name must be at least 2 characters.",
  }),
  event_start: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, {
    message: "Invalid date format.",
  }),
})

export type CreateEventContextData = {
  team_id: string
}

export function CreateEventSheet({ trigger, contextData }: { trigger: React.ReactNode, contextData: CreateEventContextData }) {
  const [disabled, setDisabled] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      event_start: new Date().toISOString()
    },
  })
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDisabled(true)

    const data = await createEvent(contextData.team_id, values.name, values.event_start)
    if (!data) {
      form.setError("name", {
        type: "manual",
        message: "Failed to create event. Please try again.",
      })
      setDisabled(false)
      return
    }

    router.push("/event/" + data.id)
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create event</SheetTitle>
          <SheetDescription>
            Event name cannot be changed later. Please choose wisely.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <Form {...form}>
            <form id="create-org-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Event name</FormLabel>
                    <FormControl>
                      <Input placeholder="Meeting with Shield" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="event_start"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Event start</FormLabel>
                    <FormControl>
                      <DatetimePicker
                        defaultValue={
                          typeof field.value === "string"
                            ? new Date(field.value)
                            : field.value || new Date().toISOString()
                        }
                        onChange={(datetime) => {
                          console.log('Selected datetime:', datetime)
                          field.onChange(datetime.toISOString())
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <SheetFooter>
          <Button type="submit" form="create-org-form" disabled={disabled}>Create event</Button>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
