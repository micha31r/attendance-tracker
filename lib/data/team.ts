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