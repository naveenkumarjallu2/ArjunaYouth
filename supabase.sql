-- =========================================================
-- ARUJUNA YOUTH GANESH CHANDA DATABASE
-- =========================================================

-- Enable UUID generation
create extension if not exists pgcrypto;


-- =========================================================
-- 1. DONATIONS TABLE
-- =========================================================

create table if not exists public.donations (

    id uuid primary key default gen_random_uuid(),

    -- Website / organization
    title text not null default 'Arujuna Youth',

    -- Donor details
    donor_name text not null,
    donor_surname text not null,
    mobile text not null,

    -- Is this mobile number connected to WhatsApp?
    is_whatsapp boolean not null default false,

    -- Address
    address text not null,

    -- Donation
    amount numeric(10,2) not null
        check (amount > 0),

    -- Cash / Online
    payment_type text not null
        check (
            payment_type in ('Cash', 'Online')
        ),

    -- Payment status
    payment_status text not null default 'Pending'
        check (
            payment_status in (
                'Pending',
                'Success',
                'Failed'
            )
        ),

    -- UPI / gateway transaction ID
    transaction_id text,

    -- Optional gateway order/payment IDs
    payment_order_id text,
    payment_payment_id text,

    -- Payment verification information
    payment_verified_at timestamptz,

    -- Created/updated timestamps
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- 2. INDEXES
-- =========================================================

create index if not exists donations_mobile_idx
on public.donations (mobile);

create index if not exists donations_payment_type_idx
on public.donations (payment_type);

create index if not exists donations_payment_status_idx
on public.donations (payment_status);

create index if not exists donations_created_at_idx
on public.donations (created_at desc);


-- =========================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.donations enable row level security;


-- =========================================================
-- 4. REMOVE OLD POLICIES IF THEY EXIST
-- =========================================================

drop policy if exists
"Anyone can submit donation"
on public.donations;

drop policy if exists
"Authenticated users can view donations"
on public.donations;

drop policy if exists
"Authenticated users can delete donations"
on public.donations;

drop policy if exists
"Authenticated users can update donations"
on public.donations;


-- =========================================================
-- 5. PUBLIC DONATION INSERT
-- =========================================================

create policy
"Anyone can submit donation"

on public.donations

for insert

to anon

with check (
    amount > 0
    and payment_type in ('Cash', 'Online')
    and payment_status in ('Pending', 'Success')
);


-- =========================================================
-- 6. AUTHENTICATED ADMIN READ ACCESS
-- =========================================================

create policy
"Authenticated users can view donations"

on public.donations

for select

to authenticated

using (true);


-- =========================================================
-- 7. AUTHENTICATED ADMIN UPDATE ACCESS
-- =========================================================

create policy
"Authenticated users can update donations"

on public.donations

for update

to authenticated

using (true)

with check (true);


-- =========================================================
-- 8. AUTHENTICATED ADMIN DELETE ACCESS
-- =========================================================

create policy
"Authenticated users can delete donations"

on public.donations

for delete

to authenticated

using (true);


-- =========================================================
-- 9. AUTOMATIC updated_at
-- =========================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


drop trigger if exists
update_donations_updated_at
on public.donations;


create trigger
update_donations_updated_at

before update
on public.donations

for each row

execute function public.update_updated_at();


-- =========================================================
-- 10. DONATION SUMMARY VIEW
-- =========================================================

create or replace view public.donation_summary as

select

    count(*) as total_donations,

    count(*) filter (
        where payment_status = 'Success'
    ) as successful_donations,

    count(*) filter (
        where payment_status = 'Pending'
    ) as pending_donations,

    count(*) filter (
        where payment_status = 'Failed'
    ) as failed_donations,

    coalesce(
        sum(amount) filter (
            where payment_status = 'Success'
        ),
        0
    ) as total_collection,

    coalesce(
        sum(amount) filter (
            where payment_status = 'Success'
            and payment_type = 'Cash'
        ),
        0
    ) as cash_collection,

    coalesce(
        sum(amount) filter (
            where payment_status = 'Success'
            and payment_type = 'Online'
        ),
        0
    ) as online_collection

from public.donations;


-- =========================================================
-- 11. DAILY COLLECTION VIEW
-- =========================================================

create or replace view public.daily_collection as

select

    date(created_at) as donation_date,

    count(*) as donation_count,

    coalesce(
        sum(amount) filter (
            where payment_status = 'Success'
        ),
        0
    ) as collection

from public.donations

group by date(created_at)

order by donation_date desc;


-- =========================================================
-- 12. TEST
-- =========================================================

select *
from public.donations
order by created_at desc;