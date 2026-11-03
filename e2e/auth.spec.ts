import { expect, test, type Page } from "@playwright/test";

// 테스트마다 새 이메일로 가입한다. 수행 기록은 계정에 묶이므로 항상 깨끗한 상태에서 시작한다.
function newAccount() {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { email: `exalone-e2e-${id}@example.com`, password: "e2e-Password-1!" };
}

async function fillCredentials(page: Page, email: string, password: string) {
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
}

async function signUp(page: Page, email: string, password: string) {
  await page.goto("/login");
  await fillCredentials(page, email, password);
  await page.getByRole("button", { name: "가입하기" }).click();
  await expect(page.getByRole("heading", { name: "ExAlone" })).toBeVisible();
}

test("로그인하지 않고 앱 주소를 열면 로그인 화면이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "로그인", exact: true })).toBeVisible();
});

test("새 이메일과 비밀번호로 가입하면 로그인된 상태로 첫 화면에 도착한다", async ({
  page,
}) => {
  const { email, password } = newAccount();
  await signUp(page, email, password);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(`${email}으로 로그인했습니다.`)).toBeVisible();
});

test("로그아웃한 뒤 같은 계정으로 다시 로그인할 수 있다", async ({ page }) => {
  const { email, password } = newAccount();
  await signUp(page, email, password);

  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login$/);

  // 로그아웃 뒤에는 보호된 화면이 다시 막힌다.
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/login$/);

  await fillCredentials(page, email, password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByText(`${email}으로 로그인했습니다.`)).toBeVisible();
});

test("잘못된 비밀번호로 로그인하면 이유를 알려 주고 로그인되지 않는다", async ({
  page,
}) => {
  const { email, password } = newAccount();
  await signUp(page, email, password);
  await page.getByRole("button", { name: "로그아웃" }).click();

  await fillCredentials(page, email, "wrong-Password-9!");
  await page.getByRole("button", { name: "로그인", exact: true }).click();

  await expect(
    page.getByText("이메일 또는 비밀번호가 맞지 않습니다."),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
});

test("새로고침해도 로그인 상태가 유지되고 로그인 화면은 첫 화면으로 보낸다", async ({
  page,
}) => {
  const { email, password } = newAccount();
  await signUp(page, email, password);

  await page.reload();
  await expect(page.getByText(`${email}으로 로그인했습니다.`)).toBeVisible();

  await page.goto("/login");
  await expect(page).toHaveURL(/\/$/);
});
