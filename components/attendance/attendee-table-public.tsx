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
import { DateTimeFormat } from "../datetime-format"

export default function AttendeeTablePublic({ data }: { data: AttendancePublicInfo[]}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-muted-foreground">
            <span className="w-24">Status</span>
          </TableHead>
          <TableHead className="text-muted-foreground">Type</TableHead>
          <TableHead className="text-muted-foreground">Modified</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((member, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{member.firstName}</TableCell>
            <TableCell className="text-muted-foreground">
              <div className="flex gap-2 w-24">
                <AttendanceBlock status={getAttendanceStatus(member.present, member.apology) as AttendanceStatus} />
                <span className="capitalize">
                  {getAttendanceStatus(member.present, member.apology)}
                </span>
              </div>
            </TableCell>
            <TableCell className="font-medium text-muted-foreground">{member.guest ? "Guest" : "Member"}</TableCell>
            <TableCell className="font-medium text-muted-foreground">
              <DateTimeFormat date={member.updated_at} connective=" / " />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Total {data.length} rows</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}