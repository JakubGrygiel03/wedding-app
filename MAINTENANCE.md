# Utrzymanie strony weselnej (Adrianna & Jan)

## Co się zepsuło 2026-11-08

Darmowy Supabase został **pauzowany** po braku aktywności bazy.

Objawy:
- `/admin` → `Nie udało się pobrać danych RSVP` / `TypeError: fetch failed`
- RSVP → `Nie udało się połączyć z bazą danych...`
- Strona publiczna wyglądała OK (fallback harmonogramu)

Przyczyna procesu keep-alive:
1. GitHub Action „Keep Supabase Alive” **pomijał ping** (`exit 0`), bo brakowało sekretów `CRON_SECRET` / `KEEP_ALIVE_URL`.
2. Na Vercel **nie było** `CRON_SECRET` (cron mógł działać przez nagłówek Vercel, ale nie było niezawodnego backupu ani alertów).

## Natychmiast po pauzie

1. Wejdź na https://supabase.com/dashboard
2. Otwórz projekt weselny
3. Jeśli status = **Paused** → kliknij **Restore / Resume**
4. Poczekaj 1–2 minuty
5. Sprawdź:
   - https://adrianna-i-jan.pl/api/health → `ok: true`
   - https://adrianna-i-jan.pl/admin → lista gości
   - wysłanie testowego RSVP

## Automatyka (nie wyłączać)

| Job | Kiedy | Endpoint |
|---|---|---|
| Vercel Cron | 06:00 i 18:00 UTC | `/api/keep-alive` |
| GitHub Actions | 06:15 i 18:15 UTC | to samo + fail = alert mailowy |

Sekrety:
- Vercel: `CRON_SECRET`
- GitHub Actions: `CRON_SECRET` (ten sam) + `KEEP_ALIVE_URL=https://adrianna-i-jan.pl/api/keep-alive`

Ręczny re-run Actions:
https://github.com/JakubGrygiel03/wedding-app/actions/workflows/keep-supabase-alive.yml

## Monitoring (zalecane)

Dodaj darmowy monitor (UptimeRobot / Better Stack / Cronitor) na:

```
https://adrianna-i-jan.pl/api/health
```

Alert, gdy status ≠ 200 lub body nie zawiera `"ok":true`.

## Checklist miesięczna

- [ ] `/api/health` zwraca `healthy`
- [ ] Ostatni run „Keep Supabase Alive” na GitHubie = success
- [ ] Logowanie do `/admin` działa
- [ ] Backup / eksport CSV gości (opcjonalnie)
- [ ] Supabase Dashboard → projekt **Active** (nie Paused)
