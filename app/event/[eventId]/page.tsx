import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/data/event";
import { Member } from "@/lib/data/member";
import EventMemberView from "@/components/event/event-member-view";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import QRCode from "react-qr-code"
import { ShareLinkButton } from "@/components/event/share-link-button";
import Link from "next/link";

function buildResponderLink(eventId: string) {
  return `${process.env.NEXT_PUBLIC_DOMAIN}/r/${eventId}`
}

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

  const responderLink = buildResponderLink(params.eventId);

  return (
    <main className="max-w-screen-sm mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-semibold">{event.name}</h1>
      <div className="space-y-4">
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_max-content] gap-8 sm:gap-4">
              <div className="space-y-4 max-w-xs">
                <h1 className="leading-none">Responder link</h1>
                <Link className="block break-all leading-normal" href={responderLink}>{responderLink}</Link>
                <ShareLinkButton className="w-max" link={responderLink} />
              </div>

              <div className="flex flex-wrap gap-4 justify-between mx-auto sm:mx-0">
                <div className="w-28 h-max p-1 bg-white">
                  <QRCode
                    className="h-auto max-w-full w-full"
                    size={256}
                    value={responderLink}
                    viewBox={`0 0 256 256`}
                    />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expected Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          <EventMemberView initialData={(event.attendee_data || []) as Member[]} eventId={event.id} />
        </CardContent>
      </Card>
    </main>
  );
}
