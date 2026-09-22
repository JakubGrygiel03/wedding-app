-- Restore plus_one_name for companion names, keep car seats in a dedicated column,
-- and track how many guests need a ride from church to the venue.

alter table guests
  add column if not exists available_car_seats integer not null default 0;

alter table guests
  add column if not exists transport_needed integer not null default 0;

-- App previously stored car-seat counts as digits in plus_one_name.
update guests
set available_car_seats = greatest(
  0,
  least(9, coalesce(nullif(trim(plus_one_name), '')::integer, 0))
)
where plus_one_name is not null
  and trim(plus_one_name) ~ '^[0-9]+$';

update guests
set plus_one_name = null
where plus_one_name is not null
  and trim(plus_one_name) ~ '^[0-9]+$';
