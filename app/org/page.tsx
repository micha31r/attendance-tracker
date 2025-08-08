import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getAllOrganisations } from "@/lib/data/organisation";
import { OrgTable } from "@/components/org/org-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function OrgListPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("Cannot get auth user, redirecting to login");
    redirect("/auth/login");
  }

  const allOrganisations = await getAllOrganisations(user.id);

  return (
    <main className="max-w-screen-md mx-auto p-4 py-8 space-y-8">
      <Alert variant="default" className="bg-secondary">
        <AlertTitle>Record Attendance</AlertTitle>
        <AlertDescription>
          To record attendance, please request the special link from the event organiser.
        </AlertDescription>
      </Alert>

      <h1 className="text-4xl font-semibold">Home</h1>

      <Card>
        <CardHeader>
          <CardTitle>Organisations</CardTitle>
          <CardDescription>Manage my organisations.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrgTable data={allOrganisations} />
        </CardContent>
      </Card>
    </main>
  );
}
