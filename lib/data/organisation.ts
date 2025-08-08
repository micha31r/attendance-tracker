"use server"
import { createClient } from "../supabase/server"
import { Member, removeDuplicateMembers } from "./member"

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

export async function updateOrgMemberData(
  orgId: string,
  memberData: Member[]
): Promise<Organisation | null> {
  const supabase = await createClient()

  const uniqueMemberData = removeDuplicateMembers(memberData)

  const { data, error } = await supabase
    .from('organisation')
    .update({ member_data: uniqueMemberData })
    .eq('id', orgId)
    .select()
    .single()

  if (error) {
    console.error('Error updating org member data:', error)
    return null
  }

  return data
}

export async function deleteOrganisation(orgId: string): Promise<boolean> {
  const supabase = await createClient()

  // Get all events associated with the organisation
  const { data: events, error: fetchEventsError } = await supabase
    .from('event')
    .select('id, team!inner(id, organisation_id)')
    .eq('team.organisation_id', orgId)

  if (fetchEventsError) {
    console.error('Error fetching events for organisation:', fetchEventsError)
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

  // Delete the events
  const { error: eventError } = await supabase
    .from('event')
    .delete()
    .in('id', events.map(event => event.id))

  if (eventError) {
    console.error('Error deleting events:', eventError)
    return false
  }

  // Delete the teams
  const { error: teamError } = await supabase
    .from('team')
    .delete()
    .eq('organisation_id', orgId)

  if (teamError) {
    console.error('Error deleting teams:', teamError)
    return false
  }

  const { error } = await supabase
    .from('organisation')
    .delete()
    .eq('id', orgId)

  if (error) {
    console.error('Error deleting organisation:', error)
    return false
  }

  return true
}