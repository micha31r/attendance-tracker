import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationById } from "@/lib/data/organisation";
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
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrgAttendanceStreak } from "@/components/org/org-attendance-streak";

export default async function OrgDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const org = await getOrganisationById(orgId);
  if (!org) {
    redirect("/org");
  }

  const allTeams = await getTeamsByOrganisationId(org.id);

  return (
    <main className="max-w-screen-lg mx-auto p-4 py-8 space-y-8">
      <div className="space-y-1">
        <h3 className="text-primary">Organisation</h3>
        <h1 className="text-4xl font-semibold">{org.name}</h1>
        <Button variant="secondary" size="sm" className="mt-1" asChild>
          <Link href={`/org`}>
            <ArrowLeft />
            Home
          </Link>
        </Button>
      </div>

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

      <OrgAttendanceStreak org={org} />
    </main>
  );
}
