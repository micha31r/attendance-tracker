"use client"
import { Event, getEventById } from "@/lib/data/event";
import { getTeamById, Team } from "@/lib/data/team";
import { DateTimeFormat } from "../datetime-format";
import { Button } from "../ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator"

function Loading() {
  return <div className="text-muted-foreground">Loading ...</div>;
}

export function AttendancePopoverContent({ eventId, children }: { eventId: string, children?: React.ReactNode }) {
  const [event, setEvent] = useState<Event>()
  const [team, setTeam] = useState<Team>()

  useEffect(() => {
    (async () => {
      const event = await getEventById(eventId)
      if (!event) return
      
      const team = await getTeamById(event.team_id)
      if (!team) return

      setEvent(event)
      setTeam(team)
    })()
  }, [eventId])

  if (!event || !team) {
    return <Loading />;
  }

  return (
    <div className="grid gap-4">
      <div className="space-y-1">
        <h4 className="leading-none font-medium">{event.name}</h4>
        <Link className="text-primary text-sm" href={`/team/${team.id}`}>{team.name}</Link>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Event start</p>
        <p className="text-md font-semibold"><DateTimeFormat date={event.event_start as string} connective=" / " /></p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Attendance open from</p>
        <p className="text-md font-semibold">{event.attendance_open_from ? <DateTimeFormat date={event.attendance_open_from as string} connective=" / " /> : "Not set"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Attendance open until</p>
        <p className="text-md font-semibold">{event.attendance_open_until ? <DateTimeFormat date={event.attendance_open_until as string} connective=" / " /> : "Not set"}</p>
      </div>
      {children && (
        <>
          <Separator />
          <div>
            {children}
          </div>
        </>
      )}
      <Button asChild variant={"secondary"}>
        <Link href={`/event/${event.id}`}>View Event</Link>
      </Button>
    </div>
  );
}