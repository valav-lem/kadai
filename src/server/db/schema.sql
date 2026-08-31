-- Kadai · initial schema
-- Invariants: GST rate is frozen onto the invoice line from the catalogue item;
-- a staff member cannot be double-booked; statutory rows are append-only.

create extension if not exists btree_gist;

do $$ begin
  create type booking_status as enum ('pending','confirmed','arrived','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type item_kind as enum ('product','service');
exception when duplicate_object then null; end $$;

do $$ begin
  create type return_type as enum ('GSTR-1','GSTR-3B');
exception when duplicate_object then null; end $$;

do $$ begin
  create type return_status as enum ('review','filed','acknowledged');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('owner','staff','accountant');
exception when duplicate_object then null; end $$;

create table if not exists staff (
  id          bigserial primary key,
  name        text not null,
  role        user_role not null default 'staff',
  colour      text not null,
  locale      text not null default 'ta',
  active      boolean not null default true
);

create table if not exists customers (
  id          bigserial primary key,
  name        text not null,
  mobile      text not null,
  gstin       text,                       -- present => B2B
  created_at  timestamptz not null default now(),
  unique (mobile)
);
create index if not exists idx_customers_name_gin on customers using gin (to_tsvector('simple', name));

create table if not exists catalogue_items (
  id              bigserial primary key,
  kind            item_kind not null,
  name            text not null,
  description     text,
  hsn             text,                   -- products
  sac             text,                   -- services
  gst_slab        numeric(4,2) not null check (gst_slab in (0,5,12,18,28)),
  price_paise     bigint not null check (price_paise >= 0),
  duration_min    int,                    -- services
  stock_qty       int,                    -- products
  reorder_point   int,
  bookable_online boolean not null default false,
  active          boolean not null default true,
  check ((kind = 'product' and hsn is not null) or (kind = 'service' and sac is not null))
);

create table if not exists bookings (
  id           bigserial primary key,
  customer_id  bigint not null references customers(id),
  item_id      bigint not null references catalogue_items(id),
  staff_id     bigint not null references staff(id),
  slot         tstzrange not null,
  status       booking_status not null default 'pending',
  source       text not null default 'counter',   -- counter | online
  payment_mode text,                               -- upi | cash | card
  paid_at      timestamptz,
  paid_amount_paise bigint,
  notes        text,
  created_at   timestamptz not null default now(),
  -- double-booking is impossible, not discouraged
  exclude using gist (
    staff_id with =, slot with &&
  ) where (status <> 'cancelled')
);

alter table bookings add column if not exists payment_mode text;
alter table bookings add column if not exists paid_at timestamptz;
alter table bookings add column if not exists paid_amount_paise bigint;
create index if not exists idx_bookings_customer_id on bookings(customer_id);
create index if not exists idx_bookings_staff_id on bookings(staff_id);
create index if not exists idx_bookings_status on bookings(status);

create table if not exists invoices (
  id            bigserial primary key,
  number        text not null unique,
  customer_id   bigint not null references customers(id),
  issued_at     timestamptz not null default now(),
  place_of_supply text not null,
  total_paise   bigint not null,
  cgst_paise    bigint not null default 0,
  sgst_paise    bigint not null default 0,
  igst_paise    bigint not null default 0
);

create table if not exists invoice_lines (
  id            bigserial primary key,
  invoice_id    bigint not null references invoices(id),
  item_id       bigint not null references catalogue_items(id),
  booking_id    bigint references bookings(id),
  description   text not null,
  hsn_sac       text not null,
  qty           numeric(10,3) not null,
  rate_paise    bigint not null,
  gst_slab      numeric(4,2) not null   -- frozen from the item at billing time
);

create table if not exists gst_returns (
  id           bigserial primary key,
  period       date not null,           -- first day of the period
  kind         return_type not null,
  status       return_status not null default 'review',
  taxable_paise bigint not null default 0,
  cgst_paise   bigint not null default 0,
  sgst_paise   bigint not null default 0,
  igst_paise   bigint not null default 0,
  arn          text,
  filed_at     timestamptz,
  unique (period, kind)
);

create table if not exists tally_pushes (
  id           bigserial primary key,
  period       date not null,
  company      text not null,
  voucher_count int not null,
  pushed_at    timestamptz not null default now(),
  result       text not null,
  xml_path     text
);

create table if not exists import_logs (
  id           bigserial primary key,
  filename     text not null,
  imported_at  timestamptz not null default now(),
  row_count    int not null,
  result       text not null
);

-- Statutory tables are append-only. Enforced by role grants, not by convention.
revoke delete, truncate on invoices, invoice_lines, gst_returns, tally_pushes, import_logs from public;
