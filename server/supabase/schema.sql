create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null check (char_length(full_name) between 2 and 80),
  preferred_position text not null default 'Midfielder' check (preferred_position in ('Winger', 'Striker', 'Midfielder', 'Defender')),
  fitness_level text not null default 'Beginner' check (fitness_level in ('Beginner', 'Intermediate', 'Advanced')),
  created_at timestamptz not null default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Agility', 'Dribbling', 'Passing', 'Stamina')),
  duration_minutes integer not null check (duration_minutes > 0),
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  description text not null default '',
  instructions text not null default '',
  video_url text not null default '',
  image_url text not null default '',
  equipment_needed text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete restrict,
  completed_at timestamptz not null default now(),
  intensity_rating integer not null default 3 check (intensity_rating between 1 and 5),
  notes text not null default '' check (char_length(notes) <= 500)
);

create index if not exists progress_logs_user_completed_idx on public.progress_logs(user_id, completed_at desc);
alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.progress_logs enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Anyone can read workouts" on public.workouts;
create policy "Anyone can read workouts" on public.workouts for select to anon, authenticated using (true);
drop policy if exists "Users can read their own progress" on public.progress_logs;
create policy "Users can read their own progress" on public.progress_logs for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can add their own progress" on public.progress_logs;
create policy "Users can add their own progress" on public.progress_logs for insert to authenticated with check (auth.uid() = user_id);

insert into public.workouts (id,title,category,duration_minutes,difficulty,description,instructions,video_url,image_url,equipment_needed) values
('56c1120a-e96f-4ccd-a2dc-7ed0501f8d01','Cone Weave & Explode','Agility',15,'Beginner','Build quick feet and a powerful first step through a compact cone pattern.','Space five markers one metre apart. Weave through with close touches, then accelerate for five metres. Walk back to reset. Complete five rounds on each foot.','https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4','https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80',array['Cones','Football']),
('56c1120a-e96f-4ccd-a2dc-7ed0501f8d02','Close-Control Circuit','Dribbling',12,'Intermediate','Keep the ball close while changing direction under control.','Set four markers in a square. Use alternating inside and outside touches to circle each marker. Keep your head up and the ball within one step. Work for 40 seconds, rest for 20, and repeat six times.','https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4','https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80',array['Cones','Football']),
('56c1120a-e96f-4ccd-a2dc-7ed0501f8d03','First Touch & Turn','Passing',15,'Beginner','Receive, scan, and turn into space with a confident first touch.','Pass the ball against a wall from three metres away. Before it returns, glance over your shoulder. Cushion the pass into space, turn, and play it back. Complete four sets of eight touches on each side.','https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4','https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',array['Football','Wall']),
('56c1120a-e96f-4ccd-a2dc-7ed0501f8d04','Tempo & Recovery','Stamina',18,'Advanced','Train repeat efforts and recover quickly between high-intensity runs.','Mark a 15-metre lane. Sprint out at 85 percent, jog back, and reset for 20 seconds. Complete eight efforts, rest for one minute, and repeat for three rounds.','https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4','https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80',array['Cones','Water'])
on conflict (id) do nothing;