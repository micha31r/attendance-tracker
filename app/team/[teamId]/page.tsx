import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTeamById, Team } from "@/lib/data/team";
import { EventTable } from "@/components/org/event-table";
import { Event, getEventsByTeamId } from "@/lib/data/event";
import TeamMemberView from "@/components/org/team-member-view";
import { Member } from "@/lib/data/member";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import  { AttendanceStreak, AttendanceStreakData } from "@/components/attendance/attendance-streak";
import { getAttendancePrivateInfoByEventId } from "@/lib/data/attendance";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StreakToggle } from "@/components/attendance/streak-toggle";

async function getAttendanceStreakData(team: Team, allEvents: Event[]): Promise<AttendanceStreakData> {
  const attendanceStreakData: AttendanceStreakData = {};

  if (team.default_attendee_data) {
    for (const member of team.default_attendee_data as Member[]) {
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

  const attendanceDataPromises = allEvents.map(event => 
    getAttendancePrivateInfoByEventId(event.id)
  );

  const allAttendanceData = (await Promise.all(attendanceDataPromises)).flat();

  for (const attendance of allAttendanceData) {
    if (attendance.email in attendanceStreakData) {
      attendanceStreakData[attendance.email].attendanceData.push(attendance);
    }
  }

  return attendanceStreakData;
}

export default async function TeamDetailPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const team = await getTeamById(teamId);
  if (!team) {
    console.error("Team not found, redirecting to /org");
    redirect("/org");
  }

  const allEvents = await getEventsByTeamId(team.id);

  const attendanceStreakData = await getAttendanceStreakData(team, allEvents);

  return (
    <main className="max-w-screen-md mx-auto p-4 py-8 space-y-8">
      <div className="space-y-1">
        <h3 className="text-primary">Team</h3>
        <h1 className="text-4xl font-semibold">{team.name}</h1>
        <Button variant="secondary" size="sm" className="mt-1" asChild>
          <Link href={`/org/${team.organisation_id}`}>
            <ArrowLeft />
            Organisation admin
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
          <CardDescription>Manage events in the team.</CardDescription>
        </CardHeader>
        <CardContent>
          <EventTable data={allEvents} contextData={{ team_id: team.id, attendee_data: team.default_attendee_data || [] }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Manage members in the team.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMemberView initialData={(team.default_attendee_data || []) as Member[]} teamId={team.id} />
        </CardContent>
      </Card>

      <StreakToggle>
        <AttendanceStreak data={attendanceStreakData} />
      </StreakToggle>
    </main>
  );
}
