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

import { createOrganisation } from "@/lib/data/organisation"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Organisation name must be at least 2 characters.",
  }),
})

export function CreateOrgSheet({ trigger }: { trigger: React.ReactNode }) {
  const [disabled, setDisabled] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setDisabled(true)

    const data = await createOrganisation(values.name)
    if (!data) {
      form.setError("name", {
        type: "manual",
        message: "Failed to create organisation. Please try again.",
      })
      setDisabled(false)
      return
    }

    router.push("/org/" + data.id)
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create organisation</SheetTitle>
          <SheetDescription>
            Organisation name cannot be changed later. Please choose wisely.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <Form {...form}>
            <form id="create-org-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Organisation name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <SheetFooter>
          <Button type="submit" form="create-org-form" disabled={disabled}>Create organisation</Button>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
