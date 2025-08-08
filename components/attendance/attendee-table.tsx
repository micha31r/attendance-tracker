import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AttendancePublicInfo } from "@/lib/data/attendance"
import AttendanceBlock, { AttendanceStatus, getAttendanceStatus } from "./attendance-block"

export default function AttendeeTable({ data }: { data: AttendancePublicInfo[]}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-muted-foreground">Type</TableHead>
          <TableHead className="flex justify-end items-center text-muted-foreground">
            <span className="w-24">Status</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((member, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{member.firstName}</TableCell>
            <TableCell className="font-medium text-muted-foreground">{member.guest ? "Guest" : "Member"}</TableCell>
            <TableCell className="flex justify-end">
              <div className="flex gap-2 w-24">
                <AttendanceBlock status={getAttendanceStatus(member.present, member.apology) as AttendanceStatus} />
                <span className="text-muted-foreground capitalize">
                  {getAttendanceStatus(member.present, member.apology)}
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total {data.length} rows</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}