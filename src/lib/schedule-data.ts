export interface SerializableScheduleEvent {
  time: string;
  title: string;
  description: string;
  locationName: string;
  googleMapsUrl?: string;
  orderIndex?: number;
}

export const DEFAULT_SCHEDULE_EVENTS: SerializableScheduleEvent[] = [
  {
    time: "14:00",
    title: "Ceremonia Ślubna",
    description:
      "Oficjalne „tak” przed ołtarzem. Prosimy o punktualne przybycie do kościoła.",
    locationName: "Kościół św. Anny",
    googleMapsUrl: "https://maps.google.com",
    orderIndex: 0,
  },
  {
    time: "15:30",
    title: "Sesja zdjęciowa",
    description:
      "Krótka sesja w otoczeniu kościoła i parku. Goście mogą w tym czasie udać się do sali.",
    locationName: "Park przy kościele",
    orderIndex: 1,
  },
  {
    time: "16:30",
    title: "Przyjęcie Weselne",
    description:
      "Powitanie gości, toast za młodych i rozpoczęcie uroczystej kolacji.",
    locationName: "Hotel Trylogia",
    googleMapsUrl: "https://maps.google.com",
    orderIndex: 2,
  },
  {
    time: "18:00",
    title: "Kolacja",
    description:
      "Serwis dań głównych, przemówienia i pierwszy taniec pary młodej.",
    locationName: "Sala Balowa — Hotel Trylogia",
    orderIndex: 3,
  },
  {
    time: "21:00",
    title: "Wjazd Tortu",
    description:
      "Iskry, świeczki i wspólne życzenia — czas na słodki finał wieczoru.",
    locationName: "Sala Balowa — Hotel Trylogia",
    orderIndex: 4,
  },
  {
    time: "23:30",
    title: "Oczepiny",
    description:
      "Tradycyjne oczepiny, zabawy i muzyka do białego rana. Przygotujcie wygodne buty!",
    locationName: "Sala Balowa — Hotel Trylogia",
    orderIndex: 5,
  },
];

export function sortScheduleEvents(
  events: SerializableScheduleEvent[],
): SerializableScheduleEvent[] {
  return [...events].sort((a, b) => {
    const orderDiff = (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
    if (orderDiff !== 0) return orderDiff;

    const [aH, aM] = a.time.split(":").map(Number);
    const [bH, bM] = b.time.split(":").map(Number);
    return aH * 60 + aM - (bH * 60 + bM);
  });
}
