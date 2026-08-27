-- 004_care_bcp_waitlist.sql
-- 介護BCPサービス先行予約ウェイトリスト。
-- /api/care-bcp-waitlist (service_role) からの INSERT のみを想定。
-- 2026/7 ローンチ前の需要検証・先行顧客獲得用途。

create table if not exists care_bcp_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  facility_name text not null,
  facility_type text not null check (
    facility_type in ('tsusho', 'nyusho', 'houmon', 'tasyou', 'sonota')
  ),
  region text,
  source text,
  created_at timestamptz not null default now(),
  notified_at timestamptz,
  constraint care_bcp_waitlist_email_facility_unique unique (email, facility_name)
);

create index if not exists idx_care_bcp_waitlist_created_at
  on care_bcp_waitlist (created_at desc);
create index if not exists idx_care_bcp_waitlist_facility_type
  on care_bcp_waitlist (facility_type);

alter table care_bcp_waitlist enable row level security;

-- service_role はデフォルトで RLS をバイパスするが、意図を明示するため
-- 明示ポリシーを置く。anon / authenticated はポリシー未定義なので拒否される。
create policy "service_role_full_access" on care_bcp_waitlist
  for all
  to service_role
  using (true)
  with check (true);

comment on table care_bcp_waitlist is
  '介護BCPサービス先行予約ウェイトリスト。/api/care-bcp-waitlist 経由でのみ書き込み。';
comment on column care_bcp_waitlist.facility_type is
  'tsusho=通所介護 / nyusho=入所介護 / houmon=訪問介護 / tasyou=多機能型 / sonota=その他';
comment on column care_bcp_waitlist.source is
  '流入元（UTM source 等）。広告経由の効果測定に使用予定。';
comment on column care_bcp_waitlist.notified_at is
  '2026/7 ローンチ時の先行案内メール送信タイムスタンプ。未送信は NULL。';
