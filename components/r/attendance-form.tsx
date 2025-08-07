"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useState } from "react"
import { markPresent } from "@/lib/data/attendance"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export function AttendanceForm({ eventId, email }: { eventId: string, email?: string }) {
  const [disabled, setDisabled] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDisabled(true)

    const data = await markPresent(eventId, values.email)
    if (!data) {
      form.setError("root", {
        type: "manual",
        message: "Failed to mark as present.",
      })
      setDisabled(false)
      return
    }

    if (!email) {
      // If email is not provided, it means the user is not authenticated
      // Redirect to the same page with the email query parameter to provide email for future requests
      window.location.href = `/r/${eventId}?email=${values.email}`
    } else {
      window.location.reload()
    }
  }

  return (
    <Form {...form}>
      <form id="attendance-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root && (
          <Alert variant={"destructive"}>
            <AlertTitle>{form.formState.errors.root.message}</AlertTitle>
            <AlertDescription>Please try again.</AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input placeholder="jane@example.com" {...field} disabled={!!email} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" form="attendance-form" disabled={disabled}>Confirm attendance</Button>
      </form>
    </Form>
  )
}
