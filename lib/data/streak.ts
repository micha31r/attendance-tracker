"use server"
import { AttendanceStreakData } from "@/components/attendance/attendance-streak";
import { Organisation } from "./organisation";
import { Member } from "./member";
import { Event, getEventsByOrganisationId } from "./event";
import { getAttendancePrivateInfoByEventId } from "./attendance";
import { Team } from "./team";

export async function getOrgAttendanceStreakData(org: Organisation): Promise<AttendanceStreakData> {
  const attendanceStreakData: AttendanceStreakData = {};

  // Populate with org member data
  if (org.member_data) {
    for (const member of org.member_data as Member[]) {
      if (!(member.email in attendanceStreakData)) {
        attendanceStreakData[member.email] = {
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          attendanceData: [],
        }
      }
    }
  }

  // Get all events in org
  const allEvents = await getEventsByOrganisationId(org.id);

  // Get attendance for each event
  const attendanceDataPromises = allEvents.map(event => 
    getAttendancePrivateInfoByEventId(event.id)
  );

  // Flatten the attendance data
  const allAttendanceData = (await Promise.all(attendanceDataPromises)).flat();

  // Populate attendance streak data
  for (const attendance of allAttendanceData) {
    if (attendance.email in attendanceStreakData) {
      attendanceStreakData[attendance.email].attendanceData.push(attendance);
    }
  }

  return attendanceStreakData;
}

export async function getTeamAttendanceStreakData(team: Team, allEvents: Event[]): Promise<AttendanceStreakData> {
  const attendanceStreakData: AttendanceStreakData = {};

  if (team.default_attendee_data) {
    for (const member of team.default_attendee_data as Member[]) {
      if (!(member.email in attendanceStreakData)) {
        attendanceStreakData[member.email] = {
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          attendanceData: [],
        }
      }
    }
  }

  const attendanceDataPromises = allEvents.map(event => 
    getAttendancePrivateInfoByEventId(event.id)
  );

  const allAttendanceData = (await Promise.all(attendanceDataPromises)).flat();

  for (const attendance of allAttendanceData) {
    if (attendance.email in attendanceStreakData) {
      attendanceStreakData[attendance.email].attendanceData.push(attendance);
    }
  }

  return attendanceStreakData;
}