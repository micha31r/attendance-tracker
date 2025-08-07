import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { AttendanceForm } from "./attendance-form"
import { ApologyForm } from "./apology-form"

export function AttendanceTabs({ acceptAttendance, eventId, email }: { acceptAttendance: boolean, eventId: string, email?: string }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue={acceptAttendance ? "attendance" : "apology"}>
        <TabsList>
          {acceptAttendance && (
            <TabsTrigger value="attendance">Record attendance</TabsTrigger>
          )}
          <TabsTrigger value="apology">Send apology</TabsTrigger>
        </TabsList>
        {acceptAttendance && (
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Record attendance</CardTitle>
                <CardDescription>Confirm your email to continue.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <AttendanceForm eventId={eventId} email={email} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
        <TabsContent value="apology">
          <Card>
            <CardHeader>
              <CardTitle>Send apology</CardTitle>
              <CardDescription>Confirm your email and add a reason to continue.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <ApologyForm eventId={eventId} email={email} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
