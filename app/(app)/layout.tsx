import Link from "next/link";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

// 로그인한 사용자가 보는 모든 화면의 공통 shell. 폭, 좌우 여백, header 위치를 여기서 관리한다.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-heading text-lg font-semibold">
            ExAlone
          </Link>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/settings" />}
            >
              설정
            </Button>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                로그아웃
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
        {children}
      </main>
    </div>
  );
}
