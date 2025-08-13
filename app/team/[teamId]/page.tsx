import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTeamById } from "@/lib/data/team";
import { EventTable } from "@/components/org/event-table";
import { getEventsByTeamId } from "@/lib/data/event";
import TeamMemberView from "@/components/org/team-member-view";
import { Member } from "@/lib/data/member";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeamAttendanceStreak } from "@/components/team/team-attendance-streak";

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

  return (
    <main className="max-w-screen-lg mx-auto p-4 py-8 space-y-8">
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

      <TeamAttendanceStreak team={team} allEvents={allEvents} />
    </main>
  );
}
