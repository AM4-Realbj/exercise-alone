import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";

import { updateDisplayName } from "./actions";

export default async function SettingsPage({
  searchParams,
}: PageProps<"/settings">) {
  const supabase = await createClient();
  // 인가 판단은 서버에서 검증한 claims로만 한다. getSession()은 쓰지 않는다.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", claims.sub)
    .maybeSingle();

  const { error, saved } = await searchParams;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>설정</CardTitle>
          <CardDescription>{claims.email}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form action={updateDisplayName} className="flex flex-col gap-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="display_name">표시 이름</FieldLabel>
                <Input
                  id="display_name"
                  name="display_name"
                  defaultValue={profile?.display_name ?? ""}
                  maxLength={50}
                />
                {saved ? <FieldDescription>저장했습니다.</FieldDescription> : null}
                {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
              </Field>
            </FieldGroup>
            <Button type="submit">저장</Button>
          </form>
        </CardContent>
      </Card>
  );
}
