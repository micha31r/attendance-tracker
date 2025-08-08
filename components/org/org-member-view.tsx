"use client"

import { Member } from "@/lib/data/member";
import { MemberView } from "./member-view";
import { Button } from "../ui/button";
import { useState } from "react";
import { updateOrgMemberData } from "@/lib/data/organisation";
import { AddOrgMemberSheet } from "./add-org-member-sheet";

export default function OrgMemberView({ initialData, orgId }: { initialData: Member[], orgId: string }) {
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

    const data = await updateOrgMemberData(orgId, updatedMemberData);
    if (!data) {
      console.error("Failed to update org member data");
      return;
    }

    setShowSaveButton(false);
    window.location.reload();
  }

  return (
    <div>
      <MemberView initialData={initialData} onChange={onChange} addMemberAction={<AddOrgMemberSheet trigger={<Button variant="outline">Add members</Button>} />} />
      {showSaveButton && (
        <div className="flex gap-2 mt-4">
          <Button className="flex-1" variant="outline" onClick={() => window.location.reload()}>Discard changes</Button>
          <Button className="flex-1" variant="default" onClick={onSubmit}>Save changes</Button>
        </div>
      )}
    </div>
  );
}