import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationById, Organisation } from "@/lib/data/organisation";
import { getTeamsByOrganisationId } from "@/lib/data/team";
import { TeamTable } from "@/components/org/team-table";
import OrgMemberView from "@/components/org/org-member-view";
import { Member } from "@/lib/data/member";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AttendanceStreak, AttendanceStreakData } from "@/components/attendance/attendance-streak";
import { getEventsByOrganisationId } from "@/lib/data/event";
import { getAttendancePrivateInfoByEventId } from "@/lib/data/attendance";

async function getAttendanceStreakData(org: Organisation): Promise<AttendanceStreakData> {
  const attendanceStreakData: AttendanceStreakData = {};

  // Populate with org member data
  if (org.member_data) {
    for (const member of org.member_data as Member[]) {
      if (!(member.email in attendanceStreakData)) {
        attendanceStreakData[member.email] = {
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          attendanceData: [],
        }
      }
    }
  }

  // Get all events in org
  const allEvents = await getEventsByOrganisationId(org.id);

  // Get attendance for each event
  const attendanceDataPromises = allEvents.map(event => 
    getAttendancePrivateInfoByEventId(event.id)
  );

  // Flatten the attendance data
  const allAttendanceData = (await Promise.all(attendanceDataPromises)).flat();

  // Populate attendance streak data
  for (const attendance of allAttendanceData) {
    if (attendance.email in attendanceStreakData) {
      attendanceStreakData[attendance.email].attendanceData.push(attendance);
    }
  }

  return attendanceStreakData;
}

export default async function OrgDetailPage({ params }: { params: { orgId: string } }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const org = await getOrganisationById(params.orgId);
  if (!org) {
    redirect("/org");
  }

  const allTeams = await getTeamsByOrganisationId(org.id);

  const attendanceStreakData = await getAttendanceStreakData(org);

  return (
    <main className="max-w-screen-md mx-auto p-4 py-8 space-y-8">
      <h1 className="text-4xl font-semibold">{org.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
          <CardDescription>Manage teams in the organisation.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamTable data={allTeams} contextData={{ organisation_id: org.id }} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Manage members in the organisation.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrgMemberView initialData={(org.member_data || []) as Member[]} orgId={org.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance streak</CardTitle>
          <CardDescription>Streak is ordered from the most recent event (on the left) to the oldest.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="px-6 overflow-x-scroll">
            <AttendanceStreak data={attendanceStreakData} />
          </div>
          <div className="px-6"></div>
        </CardContent>
      </Card>
    </main>
  );
}
