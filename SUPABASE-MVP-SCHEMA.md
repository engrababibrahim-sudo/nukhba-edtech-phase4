# Nukhba Functional MVP — Supabase/PostgreSQL Blueprint

> This project currently runs on the provided WebDev authentication/database scaffold. The following blueprint is the production Supabase/PostgreSQL target; the UI explicitly labels current flows as **Demo** and does not claim Supabase persistence is live.

## Core tables

| Table | Purpose | Key relationships |
|---|---|---|
| `profiles` | identity, locale, role, country | `auth.users.id`, role enum |
| `students` | student-specific data | `profiles.id`, `grades.id` |
| `parents` | parent-specific data | `profiles.id` |
| `parent_students` | parent/child relationship | `parents.id`, `students.id` |
| `teachers` | public profile and verification state | `profiles.id`, `currencies.id` |
| `subjects` | normalized subject catalog | country/curriculum scope |
| `grades` | education grade catalog | education system |
| `student_learning_profiles` | onboarding answers and goals | `students.id` |
| `teacher_subjects` | teacher subject/grade specializations | `teachers.id`, `subjects.id`, `grades.id` |
| `teacher_availability` | recurring and blocked time windows | `teachers.id` |
| `bookings` | trial and future lessons | student, parent, teacher, availability |
| `lesson_reports` | teacher report after a lesson | `bookings.id`, author teacher |
| `student_progress` | measured progress events | student, subject |
| `learning_plans` | next recommended actions | student |
| `notifications` | user-facing events | profile recipient |

Use UUID primary keys, `timestamptz` in UTC, `created_at`, `updated_at`, and nullable `deleted_at`. Add indexes for `(teacher_id, starts_at)`, `(student_id, starts_at)`, `(subject_id, grade_id)`, and verified teacher marketplace queries. Use a database transaction plus an exclusion constraint on teacher time ranges to prevent double booking.

## RLS policy intent

- Students can select/update only their own profile, learning profile, bookings, progress, and reports addressed to them.
- Parents can select their own records and records of students present in `parent_students`; they can create bookings for linked children.
- Teachers can update their own availability and profile, select linked students/bookings, and insert reports only for completed bookings they own.
- Admin can manage verification and catalog tables through an elevated server-side role; support has read-limited operational access.
- No client-side role check is treated as security. Every mutation must enforce `auth.uid()` and role membership in SQL/RPC.

## Demo persistence boundary

The current end-to-end journey persists the selected Demo role in local storage only to make the role-guarded UI testable without pretending a Supabase session exists. Booking confirmation and lesson report actions are Demo state. Production migration should replace these actions with typed server procedures and RLS-protected inserts.

## Current Marketplace Runtime

The active Teacher Marketplace runtime source of truth is **MySQL/TiDB + Drizzle**. Public teachers are returned by the server-side `marketplace.teachers` procedure only when `users.role = 'teacher'`, `users.accountStatus = 'active'`, and `teacher_profiles.verificationStatus = 'approved'`. The Supabase schema in this document remains a **future production architecture blueprint only**: it is not connected to the application runtime, and no synchronization or dual-write path exists.
