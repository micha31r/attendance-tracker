import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AttendancePrivateInfo } from "@/lib/data/attendance"
import AttendanceBlock, { AttendanceStatus, getAttendanceStatus } from "./attendance-block"
import { DateTimeFormat } from "../datetime-format"
import { CopyButton } from "../copy-button"

export default function AttendeeTablePrivate({ data }: { data: AttendancePrivateInfo[]}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Full name</TableHead>
          <TableHead>
            <span className="w-24">Status</span>
          </TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Modified</TableHead>
          <TableHead>Apology message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((member, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
            <TableCell>
              <div className="flex gap-2 w-24">
                <AttendanceBlock status={getAttendanceStatus(member.present, member.apology) as AttendanceStatus} />
                <span className="capitalize">
                  {getAttendanceStatus(member.present, member.apology)}
                </span>
              </div>
            </TableCell>
            <TableCell className="flex font-medium gap-2 items-center">
              <span>{member.email}</span>
              <CopyButton className="h-max p-1 px-1.5 text-xs text-muted-foreground" text={member.email} />
            </TableCell>
            <TableCell className="font-medium">{member.guest ? "Guest" : "Member"}</TableCell>
            <TableCell className="font-medium">
              <DateTimeFormat date={member.updated_at} />
            </TableCell>
            <TableCell className={`font-medium ${!member.apology ? "text-muted-foreground" : ""}`}>{member.apology ? member.apology_message : "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={6}>Total {data.length} rows</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}