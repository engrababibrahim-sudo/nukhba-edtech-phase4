-- Nukhba core Supabase migration blueprint. Apply only after connecting a Supabase project.
create type public.nukhba_role as enum ('student','parent','teacher','admin','support');
create type public.teacher_verification_status as enum ('pending','under_review','approved','rejected','suspended');
create type public.booking_status as enum ('requested','confirmed','completed','cancelled','no_show');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.nukhba_role not null default 'student',
  country_code text not null default 'SA',
  locale text not null default 'ar-SA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create table public.subjects (id uuid primary key default gen_random_uuid(), name text not null, country_code text not null default 'SA', unique(name,country_code));
create table public.grades (id uuid primary key default gen_random_uuid(), name text not null, stage text not null, education_system text not null default 'saudi');
create table public.students (id uuid primary key default gen_random_uuid(), profile_id uuid not null unique references public.profiles(id) on delete cascade, grade_id uuid references public.grades(id), created_at timestamptz not null default now());
create table public.parents (id uuid primary key default gen_random_uuid(), profile_id uuid not null unique references public.profiles(id) on delete cascade, created_at timestamptz not null default now());
create table public.parent_students (parent_id uuid references public.parents(id) on delete cascade, student_id uuid references public.students(id) on delete cascade, relationship text, primary key(parent_id, student_id));
create table public.teachers (id uuid primary key default gen_random_uuid(), profile_id uuid not null unique references public.profiles(id) on delete cascade, bio text, qualifications text, teaching_style text, years_experience int not null default 0, rating numeric(2,1), price_sar numeric(10,2), verification_status public.teacher_verification_status not null default 'pending', created_at timestamptz not null default now());
create table public.student_learning_profiles (id uuid primary key default gen_random_uuid(), student_id uuid not null unique references public.students(id) on delete cascade, role_answer text, stage text, grade_answer text, subject text, goal text, current_level text, difficulties text[], preferred_days text[], preferred_time text, lesson_type text not null default 'individual', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.teacher_subjects (teacher_id uuid references public.teachers(id) on delete cascade, subject_id uuid references public.subjects(id) on delete cascade, grade_id uuid references public.grades(id) on delete cascade, primary key(teacher_id, subject_id, grade_id));
create table public.teacher_availability (id uuid primary key default gen_random_uuid(), teacher_id uuid not null references public.teachers(id) on delete cascade, weekday int not null check (weekday between 0 and 6), starts_at time not null, ends_at time not null, timezone text not null default 'Asia/Riyadh', is_blocked boolean not null default false);
create table public.bookings (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id), parent_id uuid references public.parents(id), teacher_id uuid not null references public.teachers(id), starts_at timestamptz not null, ends_at timestamptz not null, lesson_type text not null default 'individual', status public.booking_status not null default 'requested', payment_status text not null default 'not_configured', created_at timestamptz not null default now(), check (ends_at > starts_at));
create table public.lesson_reports (id uuid primary key default gen_random_uuid(), booking_id uuid not null unique references public.bookings(id) on delete cascade, teacher_id uuid not null references public.teachers(id), topic text, taught text, comprehension text, strengths text, weaknesses text, homework text, recommendation text, next_lesson_recommendation text, created_at timestamptz not null default now());
create table public.student_progress (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade, subject_id uuid references public.subjects(id), progress_percent int check (progress_percent between 0 and 100), strength text, focus_area text, measured_at timestamptz not null default now());
create table public.learning_plans (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade, title text not null, actions jsonb not null default '[]'::jsonb, status text not null default 'active', created_at timestamptz not null default now());
create table public.notifications (id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, title text not null, body text not null, read_at timestamptz, created_at timestamptz not null default now());

create index bookings_teacher_time_idx on public.bookings(teacher_id, starts_at, ends_at);
create index bookings_student_time_idx on public.bookings(student_id, starts_at);
create index teachers_marketplace_idx on public.teachers(verification_status, rating, price_sar);
create index profiles_role_idx on public.profiles(role);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.parents enable row level security;
alter table public.parent_students enable row level security;
alter table public.teachers enable row level security;
alter table public.student_learning_profiles enable row level security;
alter table public.teacher_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.lesson_reports enable row level security;
alter table public.student_progress enable row level security;
alter table public.learning_plans enable row level security;
alter table public.notifications enable row level security;

create policy "profile owner read" on public.profiles for select using (id = auth.uid());
create policy "profile owner update" on public.profiles for update using (id = auth.uid());
create policy "student owns learning profile" on public.student_learning_profiles for all using (student_id in (select id from public.students where profile_id = auth.uid()));
create policy "parent sees linked students" on public.students for select using (id in (select student_id from public.parent_students ps join public.parents p on p.id = ps.parent_id where p.profile_id = auth.uid()) or profile_id = auth.uid());
create policy "approved teachers are public" on public.teachers for select using (verification_status = 'approved' or profile_id = auth.uid());
create policy "teacher owns availability" on public.teacher_availability for all using (teacher_id in (select id from public.teachers where profile_id = auth.uid()));
create policy "booking participants read" on public.bookings for select using (student_id in (select id from public.students where profile_id = auth.uid()) or parent_id in (select id from public.parents where profile_id = auth.uid()) or teacher_id in (select id from public.teachers where profile_id = auth.uid()));
create policy "student or linked parent create booking" on public.bookings for insert with check (student_id in (select id from public.students where profile_id = auth.uid()) or parent_id in (select id from public.parents where profile_id = auth.uid()));
create policy "report participants read" on public.lesson_reports for select using (teacher_id in (select id from public.teachers where profile_id = auth.uid()) or booking_id in (select id from public.bookings where student_id in (select id from public.students where profile_id = auth.uid()) or parent_id in (select id from public.parents where profile_id = auth.uid())));
create policy "teacher creates own report" on public.lesson_reports for insert with check (teacher_id in (select id from public.teachers where profile_id = auth.uid()));
create policy "student progress owner or parent" on public.student_progress for select using (student_id in (select id from public.students where profile_id = auth.uid()) or student_id in (select ps.student_id from public.parent_students ps join public.parents p on p.id = ps.parent_id where p.profile_id = auth.uid()));
create policy "learning plan owner or parent" on public.learning_plans for select using (student_id in (select id from public.students where profile_id = auth.uid()) or student_id in (select ps.student_id from public.parent_students ps join public.parents p on p.id = ps.parent_id where p.profile_id = auth.uid()));
create policy "notification owner" on public.notifications for select using (profile_id = auth.uid());
