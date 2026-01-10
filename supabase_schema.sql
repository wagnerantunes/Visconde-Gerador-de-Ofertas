-- Create a table for public profiles using Supabase auth
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for storing layouts (App State)
create table layouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text default 'Sem Título',
  state jsonb not null, -- Stores the entire JSON state of the flyer
  preview_url text, -- Stores a base64 thumbnail of the first page
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  CONSTRAINT layouts_user_id_name_key UNIQUE (user_id, name)
);

-- Set up Row Level Security (RLS) for layouts
alter table layouts enable row level security;

create policy "Users can view their own layouts."
  on layouts for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own layouts."
  on layouts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own layouts."
  on layouts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own layouts."
  on layouts for delete
  using ( auth.uid() = user_id );

-- Handle new user creation automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
