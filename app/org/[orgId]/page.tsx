import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationById } from "@/lib/data/organisation";
import { getTeamsByOrganisationId } from "@/lib/data/team";
import { TeamTable } from "@/components/org/team-table";
import OrgMemberView from "@/components/org/org-member-view";
import { Member } from "@/lib/data/member";

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

  return (
    <main className="max-w-screen-sm mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-semibold">{org.name}</h1>
      <div>
        <h1 className="text-2xl font-semibold">Teams</h1>
        <TeamTable data={allTeams} contextData={{ organisation_id: org.id }} />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Members</h1>
        <OrgMemberView initialData={(org.member_data || []) as Member[]} orgId={org.id} />
      </div>
    </main>
  );
}
