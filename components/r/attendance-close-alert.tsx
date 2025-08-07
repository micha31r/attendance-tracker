"use client"

import { Hourglass } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function AttendanceCloseAlert({ startDatetimeString, endDatetimeString }: { startDatetimeString: string, endDatetimeString: string }) {
  const startDate = new Date(startDatetimeString);
  const endDate = new Date(endDatetimeString);
  
  // Check if start and end are on different dates
  const isDifferentDate = startDate.toDateString() !== endDate.toDateString();
  
  const timeString = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateTimeString = isDifferentDate 
    ? `${endDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })} at ${timeString}`
    : timeString;

  return (
    <Alert variant={"default"}>
      <Hourglass />
      <AlertTitle>Check-in closes at {dateTimeString}.</AlertTitle>
      <AlertDescription>You can mark your attendance up until the deadline. After that, you&apos;ll only be able to submit an apology.</AlertDescription>
    </Alert>
  );
}