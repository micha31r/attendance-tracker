"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Member } from "@/lib/data/member"
import { MemberTable } from "./member-table"
import { useEffect, useState } from "react";
import { CodeEditor } from "./code-editor";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { z } from "zod";

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="border border-border rounded-sm px-1 py-0.5 text-xs text-primary">
      {children}
    </code>
  )
}

const MemberSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
});

const MembersArraySchema = z.array(MemberSchema);

function parseJSON(data: string) {
  try {
    const parsed = JSON.parse(data);
    const result = MembersArraySchema.safeParse(parsed);
    return result;
  } catch (error) {
    console.warn("Error parsing JSON:", error);
    return null;
  }
}

export function MemberView({ initialData }: { initialData: Member[] }) {
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
    const parsed = parseJSON(code);
    if (parsed && parsed.success) {
      setData(parsed.data);
    } else {
      console.warn("Invalid JSON format or missing required fields");
    }
  }, [code]);

  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Table view</TabsTrigger>
        <TabsTrigger value="password">Raw data (JSON)</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <MemberTable data={data} />
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