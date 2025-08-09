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

import { getOrganisationById, Organisation, updateOrgMemberData } from "@/lib/data/organisation"
import { Member, mergeMemberData } from "@/lib/data/member"

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

export function AddOrgMemberSheet({ trigger }: { trigger: React.ReactNode }) {
  const [disabled, setDisabled] = useState(false)
  const { orgId }: { orgId: string } = useParams()
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
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

    if (!organisation) {
      console.error("Organisation is not set")
      setDisabled(false)
      return
    }

    const mergedMembers = mergeMemberData([values], (organisation.member_data || []) as Member[])
    const data = await updateOrgMemberData(orgId, mergedMembers)
    if (!data) {
      console.error("Failed to update organisation members")
      setDisabled(false)
    }

    closeButtonRef.current?.click()
    window.location.reload()
  }

  useEffect(() => {
    (async () => {
      if (!orgId) {
        console.error("Organisation ID is not available")
        router.push("/org")
        return
      }

      const org = await getOrganisationById(orgId)
      if (!org) {
        console.error("Organisation not found")
        router.push("/org")
        return
      }

      setOrganisation(org)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])
  
  if (!organisation) {
    return null
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add org member</SheetTitle>
          <SheetDescription>
            Add people to your organisation using their first name, last name, and email address.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <Form {...form}>
            <form id="add-org-member-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
           <Button type="submit" form="add-org-member-form" disabled={disabled}>Add org member</Button>
          <SheetClose asChild ref={closeButtonRef}>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
