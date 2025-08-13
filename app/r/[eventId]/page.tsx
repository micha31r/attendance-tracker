import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicEventInfoById, isUserEventAdmin } from "@/lib/data/event";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, Lock, Text, TimerIcon } from "lucide-react";
import { AttendanceTabs } from "@/components/r/attendance-tabs";
import { getAttendanceByEventIdAndEmail, getAttendanceByEventIdAndEmailAnon, getAttendancePublicInfoByEventId } from "@/lib/data/attendance";
import UnmarkPresentButton from "@/components/r/unmark-present-button";
import { AttendanceCloseAlert } from "@/components/r/attendance-close-alert";
import UnmarkApologyButton from "@/components/r/unmark-apology-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttendeeTablePublic from "@/components/attendance/attendee-table-public";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function RecordAttendancePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ eventId: string }>, 
  searchParams: Promise<{ email?: string }>
}) {
  const { eventId } = await params;
  const { email: searchParamsEmail } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(!error && data?.claims);
  const email = data?.claims.email || searchParamsEmail || null;

  const attendanceDataFunction = isAuthenticated 
    ? getAttendanceByEventIdAndEmail 
    : getAttendanceByEventIdAndEmailAnon;

  const attendance = email
    ? await attendanceDataFunction(eventId, email) 
    : null;

  const isAttendanceRecorded = Boolean(attendance?.present || attendance?.apology);

  const event = await getPublicEventInfoById(eventId);
  if (!event) {
    console.error("Event not found, redirecting to /org");
    redirect("/org");
  }

  const acceptAttendance = Boolean(event.attendance_open_from && event.attendance_open_until && new Date(event.attendance_open_from) < new Date() && new Date(event.attendance_open_until) > new Date());

  const attendancePublicInfo = await getAttendancePublicInfoByEventId(eventId);

  const isEventAdmin = (data?.claims && await isUserEventAdmin(eventId, data.claims.sub)) ?? false;

  return (
    <main className="max-w-screen-lg mx-auto p-4 py-8 space-y-8">
      <div className="space-y-1">
        <h3 className="text-primary">Event</h3>
        <h1 className="text-4xl font-semibold">{event.name}</h1>
        {isEventAdmin && (
          <Button variant="secondary" size="sm" className="mt-1" asChild>
            <Link href={`/event/${eventId}`}>
              <ArrowLeft />
              Manage event
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {!isAuthenticated && (
          <Alert variant={"destructive"}>
            <Lock />
            <AlertTitle>You are not logged in!</AlertTitle>
            <AlertDescription>
              <p>
                If you are a member of this organisation, you must log in to record your attendance or submit an apology. Guests can simply enter their email address without logging in.
                <br /><Link href={`/auth/login?next=${encodeURIComponent(`/r/${eventId}`)}`} className="underline">Go to login</Link>
              </p>
            </AlertDescription>
          </Alert>
        )}

        {email && isAttendanceRecorded ? (
          <>
            <Alert className="bg-primary border-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
              <CheckCircle className="stroke-white"/>
              <AlertDescription className="flex gap-2 sm:gap-4 flex-col sm:flex-row justify-between">
                <div>
                  <p className="text-white font-semibold">{attendance?.present ? "You are marked as present." : "You have sent an apology."}</p>
                  <p className="text-white/80">
                    {acceptAttendance && attendance?.present && "You can change your attendance status until the host closes check-in for this event."}
                    {attendance?.apology && "You can withdraw your apology anytime."}
                  </p>
                </div>

                {/* Can only unmark present when event is accepting attendance */}
                {acceptAttendance && attendance?.present && (
                  <UnmarkPresentButton eventId={eventId} email={email} isAuthenticated={isAuthenticated} />
                )}

                {/* Apology can be withdrawn anytime */}
                {attendance?.apology && (
                  <UnmarkApologyButton eventId={eventId} email={email} isAuthenticated={isAuthenticated} />
                )}
              </AlertDescription>
            </Alert>

            {attendance?.apology && (
              <Alert variant={"default"}>
                <Text />
                <AlertTitle>Apology reason</AlertTitle>
                <AlertDescription>{attendance?.apology_message}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          acceptAttendance ? (
            <AttendanceCloseAlert startDatetimeString={event.attendance_open_from as string} endDatetimeString={event.attendance_open_until as string} />
          ) : (
            <Alert variant={"default"}>
              <TimerIcon />
              <AlertTitle>The host has not opened attendance registration</AlertTitle>
              <AlertDescription>You can only submit an apology now.</AlertDescription>
            </Alert>
          )
        )}
      </div>

      {!isAttendanceRecorded && (
        <AttendanceTabs acceptAttendance={acceptAttendance} eventId={eventId} email={email} isAuthenticated={isAuthenticated} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attendance list</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendeeTablePublic data={attendancePublicInfo} />
        </CardContent>
      </Card>
    </main>
  );
}
