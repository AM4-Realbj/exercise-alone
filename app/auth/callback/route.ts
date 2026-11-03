import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // next는 같은 사이트 안의 경로만 허용한다. "//evil.com" 같은 값은 기본 경로로 대체한다.
  const requestedNext = searchParams.get("next") ?? "/settings";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/settings";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (!isLocalEnv && forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const message = encodeURIComponent("구글 로그인에 실패했습니다. 다시 시도해 주세요.");
  return NextResponse.redirect(`${origin}/login?error=${message}`);
}
