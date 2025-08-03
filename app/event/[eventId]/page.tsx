import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/data/event";
import { Member } from "@/lib/data/member";
import EventMemberView from "@/components/event/event-member-view";

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const event = await getEventById(params.eventId);
  if (!event) {
    console.error("Event not found, redirecting to /org");
    redirect("/org");
  }

  return (
    <main className="max-w-screen-sm mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-semibold">{event.name}</h1>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Expected attendees</h1>
        <EventMemberView initialData={(event.attendee_data || []) as Member[]} eventId={event.id} />
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <div className="min-h-96"></div>
      </div>
    </main>
  );
}
