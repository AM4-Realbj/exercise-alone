"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

// Supabase가 주는 영어 원문 대신 사용자가 다음에 할 일을 알 수 있는 문장으로 바꾼다.
function describeAuthError(error: { code?: string }) {
  switch (error.code) {
    case "invalid_credentials":
      return "이메일 또는 비밀번호가 맞지 않습니다.";
    case "user_already_exists":
      return "이미 가입된 이메일입니다. 로그인해 주세요.";
    case "weak_password":
      return "비밀번호가 너무 약합니다. 6자 이상으로 입력해 주세요.";
    case "email_address_invalid":
    case "validation_failed":
      return "이메일 형식을 확인해 주세요.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "요청이 너무 많습니다. 잠시 뒤 다시 시도해 주세요.";
    default:
      return "처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요.";
  }
}

function backToLogin(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(
    readCredentials(formData),
  );

  if (error) backToLogin(describeAuthError(error));
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(readCredentials(formData));

  if (error) backToLogin(describeAuthError(error));
  // 이메일 확인이 꺼져 있으면 세션이 바로 만들어진다. 세션이 없다면 확인 메일이 필요한 설정이다.
  if (!data.session) {
    backToLogin("가입은 완료됐지만 이메일 확인이 켜져 있습니다. 대시보드 설정을 확인해 주세요.");
  }
  redirect("/");
}

export async function signInWithGoogle() {
  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ?? `http://${requestHeaders.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    backToLogin("구글 로그인을 시작하지 못했습니다.");
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
