# Enzama Looks

Salon booking for Enzama Looks in Entebbe. Guests book without an account. Admin and professionals sign in with email and password.

## Stack

Next.js 16, Prisma 7, MySQL, Auth.js (credentials), Tailwind 4.

## Setup

1. Copy database values into `.env` (already used locally):

```
DATABASE_URL="mysql://salon:Salon%4012345@localhost:3306/salonBooking"
AUTH_SECRET="your-secret"
```

2. Install, migrate, seed, run:

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
npm run dev
```

## Seeded logins

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@enzamalooks.com | EnzamaAdmin123 |
| Professional | amina@enzamalooks.com | EnzamaStaff123 |

Other professionals: `david@`, `grace@`, `sarah@`, `patricia@`, `joan@enzamalooks.com` — same staff password.

## Routes

- `/` marketing
- `/book` guest booking
- `/login` staff
- `/admin` management
- `/staff` professional portal
