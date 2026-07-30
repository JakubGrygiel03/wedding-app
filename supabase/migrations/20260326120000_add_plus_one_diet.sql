-- Run in Supabase SQL Editor if the column does not exist yet.
alter table guests
  add column if not exists plus_one_diet text;
