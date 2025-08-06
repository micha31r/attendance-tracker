import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/data/event";
import { Member } from "@/lib/data/member";
import EventMemberView from "@/components/event/event-member-view";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ReactDOM from "react-dom"
import QRCode from "react-qr-code"
import { ShareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShareLinkButton } from "@/components/event/share-link-button";

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
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_max-content] gap-8 sm:gap-4">
              <div className="space-y-4 max-w-xs">
                <h1 className="leading-none">Responder link</h1>
                <p className="break-all leading-normal">http://localhost:3000/event/063abf95-1005-4045-a157-11c651f9455d</p>
                <ShareLinkButton className="w-max" link={""} />
              </div>

              <div className="flex flex-wrap gap-4 justify-between mx-auto sm:mx-0">
                <div className="w-28 h-max p-1 bg-white">
                  <QRCode
                    className="h-auto max-w-full w-full"
                    size={256}
                    value={"http://localhost:3000/event/063abf95-1005-4045-a157-11c651f9455d"}
                    viewBox={`0 0 256 256`}
                    />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Expected Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <EventMemberView initialData={(event.attendee_data || []) as Member[]} eventId={event.id} />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <div className="min-h-96"></div>
      </div>
    </main>
  );
}
