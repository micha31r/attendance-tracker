"use server"
import { createClient } from "../supabase/server"
import { dangerCreateServerRoleClient } from "../supabase/server-role"
import { Member } from "./member"

export type Attendance = {
  event_id: string
  email: string
  present: boolean,
  apology: boolean,
  apology_message?: string,
  created_at: string,
  updated_at: string,
  guest: boolean,
}

export interface AttendancePublicInfo {
  firstName: string,
  guest: boolean,
  present: boolean,
  apology: boolean,
  created_at: string,
  updated_at: string,
}

export interface AttendancePrivateInfo extends AttendancePublicInfo {
  event_id: string,
  lastName: string,
  email: string,
  apology_message?: string,
}

export async function createAttendance(
  event_id: string,
  email: string,
  guest: boolean = false
): Promise<Attendance | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .insert({ event_id, email, guest })
    .select()
    .single()

  if (error) {
    console.error('Error creating attendance:', error)
    return null
  }

  return data
}

export async function getAttendanceByEventIdAndEmail(event_id: string, email: string): Promise<Attendance | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .select()
    .eq('event_id', event_id)
    .eq('email', email)
    .single()

  if (error) {
    console.error('Error fetching attendance:', error)
    return null
  }

  return data
}

export async function getAttendanceByEventIdAndEmailAnon(event_id: string, email: string): Promise<Attendance | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from('attendance')
    .select()
    .eq('event_id', event_id)
    .eq('email', email)
    .eq('guest', true)
    .single()

  if (error) {
    console.error('Error fetching attendance (anon):', error)
    return null
  }

  return data
}

export async function getAttendancesByEventId(event_id: string): Promise<Attendance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .select()
    .eq('event_id', event_id)

  if (error) {
    console.error('Error fetching attendances:', error)
    return []
  }

  return data || []
}

export async function getAttendancesByEmail(email: string): Promise<Attendance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .select()
    .eq('email', email)

  if (error) {
    console.error('Error fetching attendances by email:', error)
    return []
  }

  return data || []
}

export async function getAttendancesByTeamId(team_id: string): Promise<Attendance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .select(`
      event_id,
      email,
      present,
      apology,
      apology_message,
      created_at,
      updated_at,
      guest,
      event!inner(team_id)
    `)
    .eq('event.team_id', team_id)

  if (error) {
    console.error('Error fetching attendances by team ID:', error)
    return []
  }

  return data || []
}

export async function getAttendancesByOrganisationId(organisation_id: string): Promise<Attendance[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .select(`
      event_id,
      email,
      present,
      apology,
      apology_message,
      created_at,
      updated_at,
      guest,
      event!inner(
        team!inner(
          organisation_id
        )
      )
    `)
    .eq('event.team.organisation_id', organisation_id)

  if (error) {
    console.error('Error fetching attendances by organisation ID:', error)
    return []
  }

  return data || []
}

export async function markPresent(
  eventId: string,
  email: string
): Promise<Attendance | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .update({ present: true, apology: false, apology_message: null })
    .eq('event_id', eventId)
    .eq('email', email)
    .select()
    .single()

  if (error) {
    console.error('Error marking attendance as present:', error)
    return null
  }

  return data
}

export async function unmarkPresent(
  eventId: string,
  email: string
): Promise<Attendance | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .update({ present: false })
    .eq('event_id', eventId)
    .eq('email', email)
    .select()
    .single()

  if (error) {
    console.error('Error unmarking attendance as present:', error)
    return null
  }

  return data
}

export async function markApology(
  eventId: string,
  email: string,
  apologyMessage: string
): Promise<Attendance | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .update({ present: false, apology: true, apology_message: apologyMessage })
    .eq('event_id', eventId)
    .eq('email', email)
    .select()
    .single()

  if (error) {
    console.error('Error marking apology:', error)
    return null
  }

  return data
}

export async function unmarkApology(
  eventId: string,
  email: string
): Promise<Attendance | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendance')
    .update({ apology: false, apology_message: null })
    .eq('event_id', eventId)
    .eq('email', email)
    .select()
    .single()

  if (error) {
    console.error('Error unmarking apology:', error)
    return null
  }

  return data
}

export async function deleteAttendance(
  eventId: string,
  email: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('event_id', eventId)
    .eq('email', email)

  if (error) {
    console.error('Error deleting attendance:', error)
    return false
  }

  return true
}

export async function markPresentAnon(
  eventId: string,
  email: string
): Promise<Attendance | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from('attendance')
    .update({ present: true, apology: false, apology_message: null })
    .eq('event_id', eventId)
    .eq('email', email)
    .eq('guest', true)
    .select()
    .single()

  if (error) {
    console.error('Error marking attendance as present (anon):', error)
    return null
  }

  return data
}

export async function unmmarkPresentAnon(
  eventId: string,
  email: string
): Promise<Attendance | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from('attendance')
    .update({ present: false })
    .eq('event_id', eventId)
    .eq('email', email)
    .eq('guest', true)
    .select()
    .single()

  if (error) {
    console.error('Error unmarking attendance as present (anon):', error)
    return null
  }

  return data
}

export async function markApologyAnon(
  eventId: string,
  email: string,
  apologyMessage: string
): Promise<Attendance | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from('attendance')
    .update({ present: false, apology: true, apology_message: apologyMessage })
    .eq('event_id', eventId)
    .eq('email', email)
    .eq('guest', true)
    .select()
    .single()

  if (error) {
    console.error('Error marking apology (anon):', error)
    return null
  }

  return data
}

export async function unmarkApologyAnon(
  eventId: string,
  email: string
): Promise<Attendance | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from('attendance')
    .update({ apology: false, apology_message: null })
    .eq('event_id', eventId)
    .eq('email', email)
    .eq('guest', true)
    .select()
    .single()

  if (error) {
    console.error('Error unmarking apology (anon):', error)
    return null
  }

  return data
}

export async function getAttendancePublicInfoByEventId(
  eventId: string
): Promise<AttendancePublicInfo[]> {
  const supabase = await dangerCreateServerRoleClient()

  const { data: eventData, error: eventError } = await supabase
    .from('event')
    .select('attendee_data')
    .eq('id', eventId)
    .single()

  if (eventError) {
    console.error('Error fetching event data:', eventError)
    return []
  }

  const { data: attendanceData, error: attendeeError } = await supabase
    .from('attendance')
    .select('email, guest, present, apology, created_at, updated_at')
    .eq('event_id', eventId)

  if (attendeeError) {
    console.error('Error fetching attendance public info:', attendeeError)
    return []
  }

  const attendancePublicInfo: AttendancePublicInfo[] = attendanceData.map((attendance) => {
    const memberData = eventData.attendee_data.find((member: Member) => member.email === attendance.email);
    return {
      firstName: memberData.firstName,
      guest: attendance.guest,
      present: attendance.present,
      apology: attendance.apology,
      created_at: attendance.created_at,
      updated_at: attendance.updated_at,
    }
  }).sort((a, b) => a.firstName.localeCompare(b.firstName));

  return attendancePublicInfo
}

export async function getAttendancePrivateInfoByEventId(
  eventId: string
): Promise<AttendancePrivateInfo[]> {
  const supabase = await createClient()

  const { data: eventData, error: eventError } = await supabase
    .from('event')
    .select('attendee_data')
    .eq('id', eventId)
    .single()

  if (eventError) {
    console.error('Error fetching event data:', eventError)
    return []
  }

  const { data: attendanceData, error: attendeeError } = await supabase
    .from('attendance')
    .select('email, guest, present, apology, apology_message, created_at, updated_at')
    .eq('event_id', eventId)

  if (attendeeError) {
    console.error('Error fetching attendance public info:', attendeeError)
    return []
  }

  const attendancePrivateInfo: AttendancePrivateInfo[] = attendanceData.map((attendance) => {
    const memberData = eventData.attendee_data.find((member: Member) => member.email === attendance.email);
    return {
      event_id: eventId,
      firstName: memberData?.firstName || "Unknown",
      lastName: memberData?.lastName || "Unknown",
      email: attendance.email,
      guest: attendance.guest,
      present: attendance.present,
      apology: attendance.apology,
      apology_message: attendance.apology_message ?? "",
      created_at: attendance.created_at,
      updated_at: attendance.updated_at,
    }
  }).sort((a, b) => (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName));

  return attendancePrivateInfo
}