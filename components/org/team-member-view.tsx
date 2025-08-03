"use client"

import { Member } from "@/lib/data/member";
import { MemberView } from "./member-view";
import { AddTeamMemberSheet } from "./add-team-member-sheet";
import { Button } from "../ui/button";
import { useState } from "react";
import { updateDefaultAttendeeData } from "@/lib/data/team";

export default function TeamMemberView({ initialData, teamId }: { initialData: Member[], teamId: string }) {
  const [updatedMemberData, setUpdatedMemberData] = useState<Member[]>();
  const [showSaveButton, setShowSaveButton] = useState(false);

  function onChange(data: Member[]) {
    setUpdatedMemberData(data);
    setShowSaveButton(Boolean(data && JSON.stringify(data) !== JSON.stringify(initialData)));
  }

  async function onSubmit() {
    if (!updatedMemberData || JSON.stringify(updatedMemberData) === JSON.stringify(initialData)) {
      return;
    }

    const data = await updateDefaultAttendeeData(teamId, updatedMemberData);
    if (!data) {
      console.error("Failed to update member data");
      return;
    }

    setShowSaveButton(false);
    window.location.reload();
  }

  return (
    <div>
      <MemberView initialData={initialData} onChange={onChange} addMemberAction={<AddTeamMemberSheet trigger={<Button variant="outline">Add members</Button>} />} />
      {showSaveButton && (
        <div className="flex gap-2 mt-2">
          <Button className="flex-1" variant="outline" onClick={() => window.location.reload()}>Discard changes</Button>
          <Button className="flex-1" variant="default" onClick={onSubmit}>Save changes</Button>
        </div>
      )}
    </div>
  );
}