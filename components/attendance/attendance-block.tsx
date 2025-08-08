import { cn } from "@/lib/utils";

const colorMap = {
  present: 'bg-blue-600',
  apology: 'bg-blue-600/30',
  absent: 'bg-secondary',
}

export type AttendanceStatus = keyof typeof colorMap;

export function getAttendanceStatus(present: boolean, apology: boolean): AttendanceStatus {
  if (present) return "present"
  if (apology) return "apology"
  return "absent"
}

export default function AttendanceBlock({ 
  className,
  status,
  children,
  ...props
}: { 
  className?: string,
  status: AttendanceStatus, 
  children?: React.ReactNode,
}) {
  return (
    <div {...props} className={cn(`w-6 h-6 ${colorMap[status]} text-white rounded-md shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]`, className)}>
      {children}
    </div>
  );
}
