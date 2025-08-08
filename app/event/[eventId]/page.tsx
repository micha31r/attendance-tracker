import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/data/event";
import { Member } from "@/lib/data/member";
import EventMemberView from "@/components/event/event-member-view";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import QRCode from "react-qr-code"
import { ShareLinkButton } from "@/components/event/share-link-button";
import Link from "next/link";
import AttendeeTablePrivate from "@/components/attendance/attendee-table-private";
import { getAttendancePrivateInfoByEventId } from "@/lib/data/attendance";
import { DateTimeFormat } from "@/components/datetime-format";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { UpdateEventSheet } from "@/components/event/edit-event-sheet";
import { Button } from "@/components/ui/button";
import { Hourglass, LinkIcon } from "lucide-react";

function buildResponderLink(eventId: string) {
  return `${process.env.NEXT_PUBLIC_DOMAIN}/r/${eventId}`
}

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const event = await getEventById(params.eventId);
  if (!event) {
    console.error("Event not found, redirecting to /org");
    redirect("/org");
  }

  const responderLink = buildResponderLink(params.eventId);

  const attendancePrivateInfo = await getAttendancePrivateInfoByEventId(params.eventId);

  const acceptAttendance = Boolean(event.attendance_open_from && event.attendance_open_until && new Date(event.attendance_open_from) < new Date() && new Date(event.attendance_open_until) > new Date());

  return (
    <main className="max-w-screen-md mx-auto p-4 py-8 space-y-8">
      <h1 className="text-4xl font-semibold">{event.name}</h1>
      
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_max-content] gap-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h1 className="leading-none font-semibold">Responder link</h1>
                <p className="text-muted-foreground text-sm">Please share this link with your attendees. Members will need to log in to access it, while guests should check in using the email listed in the attendee table.</p>
              </div>
              <Alert variant={"default"}>
                <LinkIcon />
                <AlertTitle><Link className="block break-all leading-normal" href={responderLink}>{responderLink}</Link></AlertTitle>
              </Alert>
              <ShareLinkButton className="w-max" link={responderLink} />
            </div>

            <div className="flex flex-wrap gap-4 justify-between mx-auto sm:mx-0">
              <div className="w-28 h-max p-1 bg-white">
                <QRCode
                  className="h-auto max-w-full w-full"
                  size={256}
                  value={responderLink}
                  viewBox={`0 0 256 256`}
                  />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event details</CardTitle>
          <CardDescription>Attendees can check in as present only during the designated attendance window. Apologies can be submitted at any time.</CardDescription>
          <CardAction>
            <UpdateEventSheet trigger={<Button variant="outline">Edit details</Button>} contextData={{
              id: event.id,
              name: event.name,
              event_start: event.event_start as string,
              attendance_open_from: event.attendance_open_from as string,
              attendance_open_until: event.attendance_open_until as string,
            }} />
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
            
            {acceptAttendance && (
              <Alert variant={"default"}>
                <Hourglass />
                <AlertTitle>Currently accepting attendance</AlertTitle>
              </Alert>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Event start</p>
              <p className="text-lg font-semibold"><DateTimeFormat date={event.event_start as string} connective=" / " /></p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attendance open from</p>
              <p className="text-lg font-semibold">{event.attendance_open_from ? <DateTimeFormat date={event.attendance_open_from as string} connective=" / " /> : "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attendance open until</p>
              <p className="text-lg font-semibold">{event.attendance_open_until ? <DateTimeFormat date={event.attendance_open_until as string} connective=" / " /> : "Not set"}</p>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected attendees</CardTitle>
        </CardHeader>
        <CardContent>
          <EventMemberView initialData={(event.attendee_data || []) as Member[]} eventId={event.id} />
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Attendance list</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendeeTablePrivate data={attendancePrivateInfo} />
        </CardContent>
      </Card>
    </main>
  );
}
