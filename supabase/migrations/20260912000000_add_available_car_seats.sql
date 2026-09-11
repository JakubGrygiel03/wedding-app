-- Carpool seats from church to reception, collected on the guest form.
alter table guests
  add column if not exists available_car_seats integer not null default 0;

alter table guests
  add constraint guests_available_car_seats_range
  check (available_car_seats >= 0 and available_car_seats <= 9);
