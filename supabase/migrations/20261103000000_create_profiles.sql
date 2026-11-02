-- profiles: Auth 사용자 1명당 1행. 본인만 읽고 수정할 수 있다.
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  display_name text,

  primary key (id)
);

alter table public.profiles enable row level security;

-- anon에는 아무 권한도 주지 않는다. 로그인한 사용자는 표시 이름만 수정할 수 있다.
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "profiles: owner can select"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: owner can update"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 사용자가 만들어질 때 profiles 행을 함께 만든다.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

-- security definer 함수가 public API로 노출되지 않게 실행 권한을 회수한다.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 이미 가입한 사용자가 있다면 행을 채워 둔다.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
