"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Member, parseMemberJSON } from "@/lib/data/member"
import { MemberTable } from "./member-table"
import { useEffect, useState } from "react";
import { CodeEditor } from "./code-editor";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="border border-border rounded-sm px-1 py-0.5 text-xs text-primary">
      {children}
    </code>
  )
}

export function MemberView({ initialData, onChange, addMemberAction }: { initialData: Member[]; onChange?: (data: Member[]) => void; addMemberAction?: React.ReactNode }) {
  const [code, setCode] = useState(JSON.stringify(initialData, null, 4));
  const [data, setData] = useState<Member[]>(initialData);

  function cleanAndSetCode(updatedCode: string) {
    const cleanedJSONString = updatedCode
      .replaceAll("First Name [Required]", "firstName")
      .replaceAll("Last Name [Required]", "lastName")
      .replaceAll("Email Address [Required]", "email");
    setCode(cleanedJSONString);
  }

  useEffect(() => {
    (async () => {
      const parsed = parseMemberJSON(code);
      if (parsed && parsed.success) {
        setData(parsed.data);
        onChange?.(parsed.data);
      } else {
        console.warn("Invalid JSON format or missing required fields");
      }
    })();
  }, [code]);

  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Table view</TabsTrigger>
        <TabsTrigger value="password">Raw data (JSON)</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <MemberTable data={data} addMemberAction={addMemberAction} />
      </TabsContent>
      <TabsContent value="password" className="space-y-2">
        <Alert variant="default" className="bg-secondary">
          <AlertTitle>Import data</AlertTitle>
          <AlertDescription>
            <p>Export your member data as JSON and paste it here. Required fields: <Code>firstName</Code>, <Code>lastName</Code>, <Code>email</Code>.</p>
          </AlertDescription>
        </Alert>
        <CodeEditor code={code} language="json" onChange={cleanAndSetCode} />
      </TabsContent>
    </Tabs>
  )
}