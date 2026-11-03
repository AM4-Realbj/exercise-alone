import { createClient } from "@/lib/supabase/server";

// 로그인 직후 도착하는 첫 화면. 운동 정보 입력(#13)이 이 자리를 이어받는다.
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        ExAlone
      </h1>
      <p className="text-muted-foreground">
        {data?.claims.email}으로 로그인했습니다.
      </p>
    </div>
  );
}
