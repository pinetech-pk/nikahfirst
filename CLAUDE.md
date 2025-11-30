# CLAUDE.md - NikahFirst Project Guide

## 🎯 Project Overview

**NikahFirst** is a Pakistani/Muslim matrimonial platform built with Next.js. It connects individuals and families seeking marriage partners within a privacy-controlled, culturally appropriate environment.

**Live URL:** [[Add your Vercel URL here](https://nikahfirst.vercel.app/)]
**Repository:** [[Add your GitHub URL here](https://github.com/pinetech-pk/nikahfirst)]

---

## 🛠 Tech Stack

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| **Next.js 14**   | App Router, Server Components |
| **TypeScript**   | Type safety                   |
| **Tailwind CSS** | Styling                       |
| **ShadCN UI**    | Component library             |
| **Prisma**       | ORM                           |
| **PostgreSQL**   | Database (Neon)               |
| **NextAuth v4**  | Authentication                |
| **Vercel**       | Deployment                    |

---

## 📁 Project Structure

```
nikahfirst/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── src/
│   ├── app/
│   │   ├── (admin)/       # Admin panel (grouped route)
│   │   │   └── admin/
│   │   │       ├── page.tsx              # Admin dashboard
│   │   │       ├── users/
│   │   │       │   ├── regular/          # Regular users management
│   │   │       │   ├── admins/           # Admin users management
│   │   │       │   └── create-admin/     # Create new admin
│   │   │       ├── profiles/
│   │   │       │   ├── pending/          # Pending approval
│   │   │       │   ├── approved/         # Approved profiles
│   │   │       │   └── rejected/         # Rejected profiles
│   │   │       └── settings/             # System settings
│   │   ├── (auth)/                       # Auth pages (grouped)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/                    # User dashboard
│   │   ├── profile/
│   │   │   └── create/                   # Multi-step profile wizard
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/        # NextAuth handler
│   │       │   └── register/             # Registration endpoint
│   │       ├── admin/                    # Admin API routes
│   │       └── profile/                  # Profile API routes
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header/                   # Site header components
│   │   │   ├── footer/                   # Site footer
│   │   │   └── AdminLayout.tsx           # Admin panel layout
│   │   └── ui/                           # ShadCN components
│   └── lib/
│       ├── auth.ts                       # NextAuth configuration
│       ├── prisma.ts                     # Prisma client singleton
│       └── utils.ts                      # Utility functions
├── .env                                  # Environment variables (DO NOT COMMIT)
├── .env.example                          # Environment template
└── package.json
```

---

## 🗄 Database Schema

### Models Overview

| Model           | Purpose                             |
| --------------- | ----------------------------------- |
| `User`          | Authentication, roles, subscription |
| `Profile`       | Matrimonial profile data            |
| `Photo`         | Profile photos                      |
| `Connection`    | Interest/connection requests        |
| `RedeemWallet`  | Free credits (daily redemption)     |
| `FundingWallet` | Purchased credits                   |
| `Transaction`   | Credit transaction history          |

### User Roles Hierarchy

````admin users

SUPER_ADMIN     → Full system control, analytics, global settings
SUPERVISOR      → Create admins, ban users, upgrade subscriptions
CONTENT_EDITOR  → Approve/reject profiles, edit content
SUPPORT_AGENT   → Handle complaints, process refunds

``` platform users

CONSULTANT      → Matchmaking services
USER            → Regular platform users
````

### Key Enums

```typescript
UserRole: USER |
  CONSULTANT |
  SUPPORT_AGENT |
  CONTENT_EDITOR |
  SUPERVISOR |
  SUPER_ADMIN;
UserStatus: ACTIVE | INACTIVE | SUSPENDED | BANNED;
SubscriptionTier: FREE | STANDARD | SILVER | GOLD | PLATINUM | PRO;
ProfileFor: SELF | SON | DAUGHTER | BROTHER | SISTER | RELATIVE | CLIENT;
Gender: MALE | FEMALE;
MaritalStatus: NEVER_MARRIED | DIVORCED | WIDOWED | SEPARATED;
ConnectionStatus: PENDING | ACCEPTED | REJECTED | EXPIRED | BLOCKED;
```

---

## 🔐 Authentication

### NextAuth Configuration

- **Provider:** Credentials (email/password)
- **Strategy:** JWT
- **Session:** Includes `id`, `email`, `role`, `name`

### Protected Routes

```typescript
// Middleware checks:
/admin/*     → SUPER_ADMIN, SUPERVISOR, CONTENT_EDITOR, SUPPORT_AGENT
/dashboard/* → Any authenticated user
/profile/*   → Any authenticated user
```

## 💰 Credit System

### Dual Wallet System

| Wallet            | Purpose      | Source                                              |
| ----------------- | ------------ | --------------------------------------------------- |
| **RedeemWallet**  | Free credits | redemption based on subscription and platform usage |
| **FundingWallet** | Paid credits | Purchased via payment                               |

### Credit Usage Priority

1. First deduct from `FundingWallet`
2. Then deduct from `RedeemWallet`

### Credit Actions ( need to add more in global settings )

| Action           | Credits   |
| ---------------- | --------- |
| Send Interest    | 1 credit  |
| View Contact     | 2 credits |
| Premium Features | Varies    |

---

## 🎨 UI/UX Guidelines

### Component Library

- Use **ShadCN UI** components from `@/components/ui/`
- Custom components in `@/components/`
- Tailwind CSS for styling

### Design Principles

- Mobile-first responsive design
- Clean, professional appearance
- Culturally appropriate (Islamic/Pakistani context)
- Accessibility considerations

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Prisma commands
npx prisma generate      # Generate client
npx prisma db push       # Push schema changes
npx prisma db seed       # Seed database
npx prisma studio        # Open database GUI

# Git workflow
git add .
git commit -m "feat: description"
git push origin main     # Auto-deploys to Vercel
```

---

## 📝 Coding Standards

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Pages: `page.tsx` (Next.js convention)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- API routes: `route.ts`

### TypeScript

- Always define types/interfaces
- Use Zod for runtime validation
- Avoid `any` type

### API Routes Pattern

```typescript
// src/app/api/example/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await prisma.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Component Pattern

```tsx
// Client component with state
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  initialData: DataType;
}

export function MyComponent({ initialData }: Props) {
  const [data, setData] = useState(initialData);

  return <div className="p-4">{/* Component content */}</div>;
}
```

---

## ✅ Completed Features

- [x] Authentication (login/register/logout)
- [x] User registration with auto-wallet creation
- [x] Multi-step profile creation wizard
- [x] Admin panel layout with sidebar
- [x] Admin dashboard (basic)
- [x] User management pages
- [x] Profile moderation workflow (pending/approve/reject)
- [x] Role-based access control
- [x] PostgreSQL database (Neon)
- [x] Vercel deployment

---

## 🚧 In Progress / TODO

### Admin Panel

- [ ] Dashboard with real analytics data
- [ ] Global settings management (Super Admin)
- [ ] Audit logging for admin actions
- [ ] Support ticket system

### User Features

- [ ] Browse & search profiles
- [ ] Profile detail view
- [ ] Send/receive interests (connections)
- [ ] Wallet management page
- [ ] Credit purchase flow
- [ ] Photo upload (Uploadthing)

### Infrastructure

- [ ] Email notifications
- [ ] Real-time updates (Pusher)
- [ ] Payment integration (JazzCash/Stripe)

---

## ⚠️ Important Notes

### Database

- **Provider:** Neon PostgreSQL
- **Connection:** Use pooled URL for queries, direct URL for migrations
- Always run `npx prisma generate` after schema changes

### Environment Variables

Required variables (see `.env.example`):

- `DATABASE_URL` - Neon pooled connection
- `DATABASE_URL_UNPOOLED` - Neon direct connection
- `NEXTAUTH_SECRET` - Auth secret key
- `NEXTAUTH_URL` - App URL
- `NEXT_PUBLIC_APP_URL` - Public app URL

### Deployment

- Vercel auto-deploys on push to `main`
- Check Vercel logs for build errors
- Environment variables configured in Vercel dashboard

---

## 🐛 Known Issues

1. **Breadcrumbs** - Currently using manual mapping; discussed dynamic approach
2. **Logo in Admin Sidebar** - Needs dark mode variant
3. **Some pages have placeholder data** - Need real database queries

---

## 📚 Quick Reference

### Prisma Queries

```typescript
// Find many with relations
const users = await prisma.user.findMany({
  include: { profiles: true, redeemWallet: true }
})

// Find unique
const user = await prisma.user.findUnique({
  where: { id: userId }
})

// Create with relations
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    redeemWallet: { create: { balance: 10, limit: 50 } }
  }
})

// Update
await prisma.user.update({
  where: { id: userId },
  data: { status: 'ACTIVE' }
})

// Transaction
await prisma.$transaction([
  prisma.wallet.update({ ... }),
  prisma.transaction.create({ ... })
])
```

### NextAuth Session

```typescript
// Server-side
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
const userId = session?.user?.id;
const userRole = session?.user?.role;

// Client-side
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
```

### Common Imports

```typescript
// Database
import { prisma } from "@/lib/prisma";

// Auth
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Icons
import { User, Settings, LogOut } from "lucide-react";

// Utils
import { cn } from "@/lib/utils";
```

---

## 🤝 Working with Claude Code

When asking Claude Code to work on this project:

1. **Be specific** about which file/feature to work on
2. **Reference this document** for conventions
3. **Test locally** before pushing
4. **Check Vercel deployment** after push

### Example Prompts

```
"Add real data to the admin dashboard - fetch user counts, profile stats from database"

"Create the browse profiles page at /browse with filters for gender, age, city"

"Fix the admin sidebar logo to use the actual Logo component with dark mode support"

"Implement the send interest feature - deduct credits and create connection record"
```

---

_Last Updated: November 2025_
