-- Optional later upgrade. The app currently stores car-seat count in plus_one_name
-- so RSVP works without this column. Run only if you want a dedicated field.
alter table guests
  add column if not exists available_car_seats integer not null default 0;
