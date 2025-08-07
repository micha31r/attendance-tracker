"use server"
import { createClient } from "../supabase/server"

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