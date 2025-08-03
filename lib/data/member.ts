import { z } from "zod";

export type Member = {
  firstName: string,
  lastName: string,
  email: string,
}

export const MemberSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});

export const MembersArraySchema = z.array(MemberSchema);

export function parseMemberJSON(data: string) {
  try {
    const parsed = JSON.parse(data);
    const result = MembersArraySchema.safeParse(parsed);
    return result;
  } catch (error) {
    console.warn("Error parsing JSON:", error);
    return null;
  }
}

export function getMemberDataFromJSON(data: string): Member[] {
  const parsed = parseMemberJSON(data);
  if (parsed && parsed.success) {
    return parsed.data;
  } else {
    console.warn("Invalid JSON format or missing required fields");
    return [];
  }
}

export function mergeMemberData(existingData: Member[], newData: Member[]): Member[] {
  const existingEmails = new Set(existingData.map(member => member.email));
  const mergedData = [...existingData];

  for (const member of newData) {
    if (!existingEmails.has(member.email)) {
      mergedData.push(member);
    }
  }

  return mergedData;
}

export function removeDuplicateMembers(members: Member[]): Member[] {
  const seenEmails = new Set<string>();
  return members.filter(member => {
    if (seenEmails.has(member.email)) {
      return false;
    } else {
      seenEmails.add(member.email);
      return true;
    }
  });
}

// Example member data for testing

// const memberData = [
//   {
//     "firstName": "John",
//     "lastName": "Doe",
//     "email": "john.doe@example.com"
//   },
//   {
//     "firstName": "Jane",
//     "lastName": "Smith",
//     "email": "jane.smith@example.com"
//   },
//   {
//     "firstName": "Alice",
//     "lastName": "Johnson",
//     "email": "alice.johnson@example.com"
//   },
//   {
//     "firstName": "Michael",
//     "lastName": "Ren",
//     "email": "michael.ren@example.com"
//   }
// ]