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
import { markApology, markApologyAnon } from "@/lib/data/attendance"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Textarea } from "../ui/textarea"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  apology: z.string().min(2, {
    message: "Please enter a valid apology message.",
  }).max(300, {
    message: "Maximum length is 300 characters.",
  }),
})

export function ApologyForm({ eventId, email, isAuthenticated }: { eventId: string, email?: string, isAuthenticated: boolean }) {
  const [disabled, setDisabled] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email || "",
      apology: "",
    },
  })

  const dataFunction = isAuthenticated ? markApology : markApologyAnon

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDisabled(true)

    const data = await dataFunction(eventId, values.email, values.apology)
    if (!data) {
      form.setError("root", {
        type: "manual",
        message: "Failed to send apology.",
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
      <form id="apology-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <FormField
          control={form.control}
          name="apology"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea placeholder="Please enter a reason (max 300 chars)" className="resize-none max-h-32" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" form="apology-form" disabled={disabled}>Send apology</Button>
      </form>
    </Form>
  )
}
