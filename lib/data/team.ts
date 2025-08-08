"use server"
import { createClient } from "../supabase/server"
import { Member, removeDuplicateMembers } from "./member"

export type Team = {
  id: string
  organisation_id: string
  name: string
  created_at: string
  default_attendee_data?: Member[]
}

export async function createTeam(
  organisation_id: string,
  name: string
): Promise<Team | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team')
    .insert({ organisation_id, name })
    .select()
    .single()

  if (error) {
    console.error('Error creating team:', error)
    return null
  }

  return data
}

export async function getTeamById(id: string): Promise<Team | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching team:', error)
    return null
  }

  return data
}

export async function getTeamsByOrganisationId(organisation_id: string): Promise<Team[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('team')
    .select()
    .eq('organisation_id', organisation_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching teams:', error)
    return []
  }

  return data || []
}

export async function updateDefaultAttendeeData(
  teamId: string,
  attendeeData: Member[]
): Promise<Team | null> {
  const supabase = await createClient()

  const uniqueAttendeeData = removeDuplicateMembers(attendeeData)

  const { data, error } = await supabase
    .from('team')
    .update({ default_attendee_data: uniqueAttendeeData })
    .eq('id', teamId)
    .select()
    .single()

  if (error) {
    console.error('Error updating default attendee data:', error)
    return null
  }

  return data
}

export async function deleteTeam(id: string): Promise<boolean> {
  const supabase = await createClient()

  // Get all events associated with the team
  const { data: events, error: fetchEventsError } = await supabase
    .from('event')
    .select('id')
    .eq('team_id', id)

  if (fetchEventsError) {
    console.error('Error fetching events for team:', fetchEventsError)
    return false
  }

  // Delete attendance records for the events
  const { error: attendanceError } = await supabase
    .from('attendance')
    .delete()
    .in('event_id', events.map(event => event.id))

  if (attendanceError) {
    console.error('Error deleting attendance for events:', attendanceError)
    return false
  }

  // Delete the events associated with the team
  const { error: eventError } = await supabase
    .from('event')
    .delete()
    .eq('team_id', id)

  if (eventError) {
    console.error('Error deleting events for team:', eventError)
    return false
  }

  const { error: teamError } = await supabase
    .from('team')
    .delete()
    .eq('id', id)

  if (teamError) {
    console.error('Error deleting team:', teamError)
    return false
  }

  return true
}