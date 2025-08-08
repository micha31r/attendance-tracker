import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicEventInfoById } from "@/lib/data/event";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Text, TimerIcon } from "lucide-react";
import { AttendanceTabs } from "@/components/r/attendance-tabs";
import { getAttendanceByEventIdAndEmail, getAttendanceByEventIdAndEmailAnon, getAttendancePublicInfoByEventId } from "@/lib/data/attendance";
import UnmarkPresentButton from "@/components/r/unmark-present-button";
import { AttendanceCloseAlert } from "@/components/r/attendance-close-alert";
import UnmarkApologyButton from "@/components/r/unmark-apology-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AttendeeTablePublic from "@/components/attendance/attendee-table-public";

export default async function RecordAttendancePage({ 
  params, 
  searchParams 
}: { 
  params: { eventId: string }, 
  searchParams: { email?: string }
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(!error && data?.claims);
  const email = data?.claims.email || searchParams.email || null;

  const attendanceDataFunction = isAuthenticated 
    ? getAttendanceByEventIdAndEmail 
    : getAttendanceByEventIdAndEmailAnon;

  const attendance = email
    ? await attendanceDataFunction(params.eventId, email) 
    : null;

  const isAttendanceRecorded = Boolean(attendance?.present || attendance?.apology);

  const event = await getPublicEventInfoById(params.eventId);
  if (!event) {
    console.error("Event not found, redirecting to /org");
    redirect("/org");
  }

  const acceptAttendance = Boolean(event.attendance_open_from && event.attendance_open_until && new Date(event.attendance_open_from) < new Date() && new Date(event.attendance_open_until) > new Date());

  const attendancePublicInfo = await getAttendancePublicInfoByEventId(params.eventId);

  return (
    <main className="max-w-screen-md mx-auto p-4 py-8 space-y-8">
      <h1 className="text-4xl font-semibold">{event.name}</h1>

        <div className="space-y-2">
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
                    <UnmarkPresentButton eventId={params.eventId} email={email} isAuthenticated={isAuthenticated} />
                  )}

                  {/* Apology can be withdrawn anytime */}
                  {attendance?.apology && (
                    <UnmarkApologyButton eventId={params.eventId} email={email} isAuthenticated={isAuthenticated} />
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
          <AttendanceTabs acceptAttendance={acceptAttendance} eventId={params.eventId} email={email} isAuthenticated={isAuthenticated} />
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
