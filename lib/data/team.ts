"use server"
import { createClient } from "../supabase/server"

export type Team = {
  id: string
  organisation_id: string
  name: string
  created_at: string
  default_attendee_data?: string
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
