
-- Switch helper functions to SECURITY INVOKER and lock search_path
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security invoker set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security invoker set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','kitchen'))
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;

-- Allow users to read their OWN roles only (used by has_role under SECURITY INVOKER)
-- Existing "user reads own roles" policy already covers this.
