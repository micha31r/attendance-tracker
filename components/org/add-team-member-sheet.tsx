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
import { MemberTableSelectable } from "./member-table-selectable"
import { getTeamById, Team, updateDefaultAttendeeData } from "@/lib/data/team"
import { Member, mergeMemberData } from "@/lib/data/member"

export function AddTeamMemberSheet({ trigger }: { trigger: React.ReactNode }) {
  const [disabled, setDisabled] = useState(false)
  const { teamId }: { teamId: string } = useParams()
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const router = useRouter()

  useEffect(() => {
    (async () => {
      if (!teamId) {
        console.error("Team ID is not available")
        router.push("/org")
        return
      }

      const team = await getTeamById(teamId)
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

      setTeam(team)
      setOrganisation(org)
    })()
  }, [teamId, router])
  
  // Get members that can be added to the team
  function getCanAddMembers() {
    if (!organisation || !team) {
      console.error("Organisation or team is not set")
      return []
    }

    if (!organisation.member_data) {
      console.warn("Member data is not available in organisation")
      return []
    }

    const teamAttendees = (team.default_attendee_data || []) as Member[];
    const existingTeamMemberEmailsSet = new Set(teamAttendees.map(member => member.email));
    const canAddMembers = organisation.member_data.filter(member => !existingTeamMemberEmailsSet.has(member.email));
    return canAddMembers;
  }
  
  async function onSubmit() {
    setDisabled(true)

    if (!team) {
      console.error("Team is not set")
      setDisabled(false)
      return
    }

    const mergedMembers = mergeMemberData(selectedMembers, (team.default_attendee_data || []) as Member[])
    const data = await updateDefaultAttendeeData(teamId, mergedMembers)
    if (!data) {
      console.error("Failed to update team members")
      setDisabled(false)
    }

    closeButtonRef.current?.click()
    window.location.reload()
  }

  if (!organisation || !team) {
    return null
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add members</SheetTitle>
          <SheetDescription>
            Add members from your organisation to this team. You can add multiple members at once by selecting multiple rows.
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <MemberTableSelectable data={getCanAddMembers()} onChange={data => setSelectedMembers(data)} />
        </div>

        <SheetFooter>
          <Button onClick={onSubmit} disabled={disabled}>Add members</Button>
          <SheetClose asChild ref={closeButtonRef}>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
