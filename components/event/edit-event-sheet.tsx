"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
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

import { updateEvent } from "@/lib/data/event"
import { DatetimePicker } from "../org/datetime-picker"

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
  attendance_open_from: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, {
    message: "Invalid date format.",
  }),
  attendance_open_until: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, {
    message: "Invalid date format.",
  }),
})

export type UpdateEventContextData = {
  id: string,
  name: string,
  event_start: string,
  attendance_open_from: string,
  attendance_open_until: string,
}

export function UpdateEventSheet({ trigger, contextData }: { trigger: React.ReactNode, contextData: UpdateEventContextData }) {
  const [disabled, setDisabled] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contextData.name,
      event_start: contextData.event_start,
      attendance_open_from: contextData.attendance_open_from,
      attendance_open_until: contextData.attendance_open_until,
    },
  })
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDisabled(true)

    const data = await updateEvent(
      contextData.id,
      values.name,
      values.event_start,
      values.attendance_open_from,
      values.attendance_open_until
    )
    if (!data) {
      form.setError("name", {
        type: "manual",
        message: "Failed to update event. Please try again.",
      })
      setDisabled(false)
      return
    }

    window.location.reload()
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update event</SheetTitle>
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
              <FormField
                control={form.control}
                name="attendance_open_from"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Accept attendance from</FormLabel>
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
              <FormField
                control={form.control}
                name="attendance_open_until"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Accept attendance until</FormLabel>
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
          <Button type="submit" form="create-org-form" disabled={disabled}>Update event</Button>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
