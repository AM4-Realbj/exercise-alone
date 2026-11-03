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

function backToLogin(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(
    readCredentials(formData),
  );

  if (error) backToLogin(error.message);
  redirect("/settings");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(readCredentials(formData));

  if (error) backToLogin(error.message);
  // 이메일 확인이 꺼져 있으면 세션이 바로 만들어진다. 세션이 없다면 확인 메일이 필요한 설정이다.
  if (!data.session) {
    backToLogin("가입은 완료됐지만 이메일 확인이 켜져 있습니다. 대시보드 설정을 확인해 주세요.");
  }
  redirect("/settings");
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
    backToLogin(error?.message ?? "구글 로그인을 시작하지 못했습니다.");
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
