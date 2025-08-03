import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTeamById } from "@/lib/data/team";
import { EventTable } from "@/components/org/event-table";
import { getEventsByTeamId } from "@/lib/data/event";

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
      <div>
        <h1 className="text-4xl font-semibold">{team.name}&apos;s events</h1>
        <EventTable data={allEvents} contextData={{ team_id: team.id }} />
      </div>
    </main>
  );
}
