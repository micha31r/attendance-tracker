"use server"
import { createClient } from "../supabase/server"
import { Member } from "./member"

export type Organisation = {
  id: string
  name: string
  member_data: Member[] | null,
  owner_id: string
  created_at: string
}

export async function createOrganisation(
  name: string
): Promise<Organisation | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organisation')
    .insert({ name })
    .select()
    .single()

  if (error) {
    console.error('Error creating organisation:', error)
    return null
  }

  return data
}

export async function getOrganisationById(id: string): Promise<Organisation | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organisation')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching organisation:', error)
    return null
  }

  return data
}

export async function getAllOrganisations(owner_id: string): Promise<Organisation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organisation')
    .select()
    .eq('owner_id', owner_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organisations:', error)
    return []
  }

  return data || []
}