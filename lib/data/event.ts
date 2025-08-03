"use server"
import { createClient } from "../supabase/server"
import { Organisation } from "./organisation"

export type Event = {
  id: string
  team_id: string
  name: string,
  attendance_open_duration: number,
  attendance_open_from: Date,
  accept_attendance: boolean,
  attendee_data?: string,
  event_start: string,
  created_at: string
}

export async function createEvent(
  team_id: string,
  name: string,
  event_start: string,
): Promise<Event | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event')
    .insert({ team_id, name, event_start })
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
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

