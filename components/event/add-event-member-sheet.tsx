import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
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

import { getOrganisationById, Organisation } from "@/lib/data/organisation"
import { MemberTableSelectable } from "@/components/org/member-table-selectable"
import { getTeamById } from "@/lib/data/team"
import { Member, mergeMemberData } from "@/lib/data/member"
import { Event, getEventById, updateEventAttendeeData } from "@/lib/data/event"
import { AddEventGuestSheet } from "./add-event-guest-sheet"

export function AddEventMemberSheet({ trigger }: { trigger: React.ReactNode }) {
  const [disabled, setDisabled] = useState(false)
  const { eventId }: { eventId: string } = useParams()
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()

  useEffect(() => {
    (async () => {
      // TODO: Optimise using join queries

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

      const team = await getTeamById(event.team_id)
      if (!team) {
        console.error("Team not found")
        router.push("/org")
        return
      }

      const org = await getOrganisationById(team.organisation_id)
      if (!org) {
        console.error("Organisation not found")
        router.push("/org")
        return
      }

      setEvent(event)
      setOrganisation(org)
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])
  
  // Get members that can be added to the team
  function getCanAddMembers() {
    if (!organisation || !event) {
      console.error("Organisation or event is not set")
      return []
    }

    if (!organisation.member_data) {
      console.warn("Member data is not available in organisation")
      return []
    }

    const eventAttendees = (event.attendee_data || []) as Member[];
    const existingEventAttendeeEmailsSet = new Set(eventAttendees.map(member => member.email));
    const canAddMembers = organisation.member_data.filter(member => !existingEventAttendeeEmailsSet.has(member.email));
    return canAddMembers;
  }
  
  async function onSubmit() {
    setDisabled(true)

    if (!event) {
      console.error("Event is not set")
      setDisabled(false)
      return
    }

    const mergedMembers = mergeMemberData(selectedMembers, (event.attendee_data || []) as Member[])
    const data = await updateEventAttendeeData(event.id, mergedMembers)
    if (!data) {
      console.error("Failed to update event attendee data")
      setDisabled(false)
    }

    closeButtonRef.current?.click()
    window.location.reload()
  }

  if (!organisation || !event) {
    return null
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add attendees</SheetTitle>
          <SheetDescription>
            Add members from your organisation to this event. You can add multiple members at once by selecting multiple rows.
          </SheetDescription>
          <div className="mt-4 space-y-2">
            <p className="font-semibold text-muted-foreground">Not in your organisation?</p>
            <AddEventGuestSheet trigger={<Button className="w-full" variant="outline">Add guest attendee</Button>} />
          </div>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <MemberTableSelectable data={getCanAddMembers()} onChange={data => setSelectedMembers(data)} />
        </div>

        <SheetFooter>
          <Button onClick={onSubmit} disabled={disabled}>Add attendees</Button>
          <SheetClose asChild ref={closeButtonRef}>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
