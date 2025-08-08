import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AttendancePrivateInfo } from "@/lib/data/attendance"
import AttendanceBlock, { AttendanceStatus, getAttendanceStatus } from "./attendance-block"
import { CopyButton } from "../copy-button"
import { AttendancePopoverContent } from "./attendance-popover-content"

export interface AttendanceStreakInfo {
  firstName: string;
  lastName: string;
  email: string;
  attendanceData: AttendancePrivateInfo[];
}

export interface AttendanceStreakData {
  [email: string]: AttendanceStreakInfo;
}

export function AttendanceStreak({ data }: { data: AttendanceStreakData }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Full name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="w-full">Streak</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.values(data).map((entry, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{entry.firstName} {entry.lastName}</TableCell>
            <TableCell className="flex font-medium gap-2 items-center">
              <span>{entry.email}</span>
              <CopyButton className="h-max p-1 px-1.5 text-xs text-muted-foreground" text={entry.email} />
            </TableCell>
            <TableCell>
              <div className="flex gap-2 w-24">
                <div className="flex gap-1">
                  {entry.attendanceData.map((attendance, idx) => (
                    <Popover key={idx}>
                      <PopoverTrigger>
                        <AttendanceBlock
                          status={getAttendanceStatus(attendance.present, attendance.apology) as AttendanceStatus}
                          className="w-6 h-6"
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-80 mx-4">
                        <AttendancePopoverContent eventId={attendance.event_id} />
                      </PopoverContent>
                    </Popover>
                  ))}
                  {!entry.attendanceData.length && (
                    <span className="text-muted-foreground">No data yet</span>
                  )}
                </div>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total {Object.keys(data).length} rows</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}