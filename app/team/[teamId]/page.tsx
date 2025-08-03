import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTeamById } from "@/lib/data/team";
import { EventTable } from "@/components/org/event-table";
import { getEventsByTeamId } from "@/lib/data/event";
import TeamMemberView from "@/components/org/team-member-view";
import { Member } from "@/lib/data/member";

export default async function TeamDetailPage({ params }: { params: { orgId: string, teamId: string } }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const team = await getTeamById(params.teamId);
  if (!team) {
    console.error("Team not found, redirecting to /org");
    redirect("/org");
  }

  const allEvents = await getEventsByTeamId(team.id);

  return (
    <main className="max-w-screen-sm mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-semibold">{team.name}</h1>
      <div>
        <h1 className="text-2xl font-semibold">Events</h1>
        <EventTable data={allEvents} contextData={{ team_id: team.id }} />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Members</h1>
        <TeamMemberView initialData={(team.default_attendee_data || []) as Member[]} teamId={team.id} />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <div className="min-h-96"></div>
      </div>
    </main>
  );
}
