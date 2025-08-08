"use server"
import { createClient } from "../supabase/server"
import { dangerCreateServerRoleClient } from "../supabase/server-role"
import { createAttendance, deleteAttendance } from "./attendance"
import { Member, removeDuplicateMembers } from "./member"

export type Event = {
  id: string
  team_id: string
  name: string,
  attendance_open_from: string | Date,
  attendance_open_until: string | Date,
  attendee_data?: Member[] | null,
  event_start: string | Date,
  created_at: string | Date
}

export type EventPublicInfo = {
  id: string
  name: string,
  attendance_open_from: string | Date,
  attendance_open_until: string | Date,
  event_start: string | Date,
  created_at: string | Date
}

export async function createEvent(
  team_id: string,
  name: string,
  event_start: string,
  attendance_open_from: string | Date,
  attendance_open_until: string | Date,
  attendee_data: Member[]
): Promise<Event | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event')
    .insert({ 
      team_id, 
      name, 
      event_start, 
      attendance_open_from, 
      attendance_open_until,
      attendee_data
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    return null
  }

  return data
}

export async function updateEvent(
  id: string,
  name: string,
  event_start: string,
  attendance_open_from: string | Date,
  attendance_open_until: string | Date,
): Promise<Event | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event')
    .update({ 
      name, 
      event_start, 
      attendance_open_from, 
      attendance_open_until
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating event:', error)
    return null
  }

  return data
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching event:', error)
    return null
  }

  return data
}

export async function getEventsByOrganisationId(organisationId: string): Promise<Event[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event')
    .select()
    .eq('team.organisation_id', organisationId)
    .order('event_start', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return data || []
}

export async function getEventsByTeamId(team_id: string): Promise<Event[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event')
    .select()
    .eq('team_id', team_id)
    .order('event_start', { ascending: false })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return data || []
}

export async function updateEventAttendeeData(
  eventId: string,
  attendeeData: Member[]
): Promise<Event | null> {
  const supabase = await createClient()

  const uniqueMemberData = removeDuplicateMembers(attendeeData)

  const { data: eventData, error: eventError } = await supabase
    .from('event')
    .update({ attendee_data: uniqueMemberData })
    .eq('id', eventId)
    .select()
    .single()

  if (eventError) {
    console.error('Error updating event attendee data:', eventError)
    return null
  }

  const { data: attendanceData, error: attendanceError } = await supabase
    .from('attendance')
    .select()
    .eq('event_id', eventId)

  if (attendanceError) {
    console.error('Error fetching attendance data:', attendanceError)
    return null
  }

  // Find members to add and remove
  const existingEmails = new Set(attendanceData?.map(att => att.email) || [])
  const newEmails = new Set(uniqueMemberData.map(member => member.email))
  
  const membersToAdd = uniqueMemberData.filter(member => !existingEmails.has(member.email))
  const attendanceToDelete = attendanceData?.filter(att => !newEmails.has(att.email)) || []

  // Execute all operations concurrently
  const operations = [
    ...membersToAdd.map(member => createAttendance(eventId, member.email, member.guest)),
    ...attendanceToDelete.map(att => deleteAttendance(eventId, att.email))
  ]

  if (operations.length > 0) {
    await Promise.all(operations)
  }

  return eventData
}

export async function getPublicEventInfoById(id: string): Promise<EventPublicInfo | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from('event')
    .select('id, name, event_start, attendance_open_from, attendance_open_until, created_at')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching public event info:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    event_start: data.event_start,
    attendance_open_from: data.attendance_open_from,
    attendance_open_until: data.attendance_open_until,
    created_at: data.created_at
  }
}