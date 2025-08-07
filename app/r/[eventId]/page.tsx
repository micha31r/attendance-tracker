import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/data/event";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Text, TimerIcon } from "lucide-react";
import { AttendanceTabs } from "@/components/r/attendance-tabs";
import { getAttendanceByEventIdAndEmail } from "@/lib/data/attendance";
import UnmarkPresentButton from "@/components/r/unmark-present-button";
import { AttendanceCloseAlert } from "@/components/r/attendance-close-alert";
import UnmarkApologyButton from "@/components/r/unmark-apology-button";

export default async function RecordAttendancePage({ 
  params, 
  searchParams 
}: { 
  params: { eventId: string }, 
  searchParams: { email?: string }
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email || searchParams.email || null;

  const attendance = email
    ? await getAttendanceByEventIdAndEmail(params.eventId, email) 
    : null;

  const isAttendanceRecorded = Boolean(attendance?.present || attendance?.apology);

  const event = await getEventById(params.eventId);
  if (!event) {
    console.error("Event not found, redirecting to /org");
    redirect("/org");
  }

  const acceptAttendance = Boolean(event.attendance_open_from && event.attendance_open_until && new Date(event.attendance_open_from) < new Date() && new Date(event.attendance_open_until) > new Date());

  return (
    <main className="max-w-screen-sm mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-semibold">{event.name}</h1>

        <div className="space-y-2">
          {email && isAttendanceRecorded ? (
            <>
              <Alert className="bg-primary border-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
                <CheckCircle className="stroke-white"/>
                <AlertDescription className="flex gap-2 sm:gap-4 flex-col sm:flex-row">
                  <div>
                    <p className="text-white font-semibold">{attendance?.present ? "You are marked as present." : "You have sent an apology."}</p>
                    {acceptAttendance && (
                      <p className="text-white/80">You can change your attendance status until the host closes check-in for this event.</p>
                    )}
                  </div>
                  {acceptAttendance && (
                    attendance?.present ? (
                      <UnmarkPresentButton eventId={params.eventId} email={email} />
                    ) : (
                      <UnmarkApologyButton eventId={params.eventId} email={email} />
                    )
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
          <AttendanceTabs acceptAttendance={acceptAttendance} eventId={params.eventId} email={email} />
        )}
    </main>
  );
}
