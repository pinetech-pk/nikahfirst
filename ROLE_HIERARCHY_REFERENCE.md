# 👥 NikahFirst - Role Hierarchy & Permissions Reference

## 📊 Role Hierarchy (Top to Bottom)

```
┌─────────────────────────────────────┐
│      SUPER_ADMIN (Level 4)          │  Ahmad Mustafa
│  Full System Control & Analytics    │
└─────────────────────────────────────┘
                 │
                 ├─── Can Create ───┐
                 │                  │
         ┌───────▼──────────┐      │
         │   SUPERVISOR     │◄─────┘
         │    (Level 3)     │
         │ Senior Moderator │
         └──────────────────┘
                 │
                 ├─── Can Create ───┐
                 │                  │
    ┌────────────▼─────────────┬───▼──────────────┬────────────────┐
    │   CONTENT_EDITOR         │  CONSULTANT      │ SUPPORT_AGENT  │
    │     (Level 2a)           │   (Level 2b)     │   (Level 1)    │
    │ Content Moderation       │  Matchmaking     │ Customer Care  │
    │                          │  (Not in MVP)    │                │
    └──────────────────────────┴──────────────────┴────────────────┘
                                      │
                            ┌─────────▼─────────┐
                            │       USER        │
                            │ Regular Members   │
                            └───────────────────┘
```

---

## 🔐 Detailed Permission Matrix

### 🟦 SUPER_ADMIN (Level 4) - Full Control
**Who:** Ahmad Mustafa (Founder/Owner)

**Can Do:**
- ✅ Create & manage all admin types (Supervisor, Content Editor, Consultant, Support Agent)
- ✅ View complete analytics dashboard (moderator performance, tasks, system metrics)
- ✅ Manage global settings:
  - Credit system (limits, costs, redemption intervals)
  - Connection settings (request limits, cooldown periods)
  - Profile settings (approval thresholds, quality constraints)
  - Business rules & strategies
- ✅ Override any decision made by lower roles
- ✅ Access all system logs and audit trails
- ✅ Manage subscriptions and pricing tiers
- ✅ Ban/suspend/delete any user or admin
- ✅ Financial settings & reporting

**Cannot Do:**
- ❌ Nothing - has full access

---

### 🟩 SUPERVISOR (Level 3) - Senior Moderator
**Who:** Trusted senior team members

**Can Do:**
- ✅ Create lower-level admins (Content Editor, Consultant, Support Agent)
- ✅ All Content Editor permissions (see below)
- ✅ **PLUS these exclusive powers:**
  - Upgrade members to Premium subscription
  - Downgrade Premium members to Free
  - Ban user accounts (temporarily or permanently)
  - Suspend user accounts
  - Control spam/abuse reports
  - Create support teams
  - Create billing teams
  - Manage lower-tier staff (Content Editors, Support Agents)

**Cannot Do:**
- ❌ Create other Supervisors or Super Admins
- ❌ Access global system settings
- ❌ View complete analytics (only their team's performance)
- ❌ Override Super Admin decisions

---

### 🟨 CONTENT_EDITOR (Level 2a) - Content Quality Control
**Who:** Content moderation team

**Can Do:**
- ✅ Approve/reject member account registrations
  - Individual members
  - Nikah Consultant accounts
- ✅ Approve/reject profile submissions (Ristha)
  - Review complete profile data
  - Check photo quality and authenticity
  - Verify information accuracy
- ✅ Edit profile data to align with best practices
  - Fix spelling/grammar
  - Standardize formatting
  - Improve descriptions
  - Update incomplete fields
- ✅ View profile analytics (views, engagement)
- ✅ Add internal notes to profiles

**Cannot Do:**
- ❌ Upgrade accounts to Premium (only Supervisor can)
- ❌ Ban or suspend users (only Supervisor can)
- ❌ Handle financial matters (refunds, payments)
- ❌ Create other admins
- ❌ Access user wallets or credits
- ❌ Delete profiles permanently

---

### 🟧 CONSULTANT (Level 2b) - Matchmaking Services
**Who:** Office staff handling premium client services  
**Status:** 🚫 Not included in MVP - Future implementation

**Will Be Able To (Future):**
- ✅ Verify profile data after in-person meetings
- ✅ Add review/notes on behalf of clients
- ✅ Provide personalized matchmaking services
- ✅ Contact prospects on behalf of premium members
- ✅ Schedule meetings between compatible matches
- ✅ Send messages/connection requests for clients

**Will NOT Be Able To:**
- ❌ Approve/reject profiles
- ❌ Ban or suspend users
- ❌ Create other admins
- ❌ Handle payments/refunds

---

### 🟥 SUPPORT_AGENT (Level 1) - Customer Service
**Who:** Customer support team (frontline)

**Can Do:**
- ✅ Handle customer complaints
- ✅ Respond to support tickets
- ✅ Mark refund requests as:
  - "In Processing"
  - "Completed" (with transaction details)
  - Note: Actual refund done outside system
- ✅ Guide users through platform features
- ✅ Help with profile completion
- ✅ Answer FAQs

**Cannot Do:**
- ❌ Modify profile content
- ❌ Approve/reject profiles
- ❌ Ban or suspend users
- ❌ Access financial systems (except marking refund status)
- ❌ Create other admins
- ❌ Process actual payments/refunds

---

## 🎯 Permission Keywords (For Code Reference)

```typescript
// Use these permission keys in your code
const PERMISSIONS = {
  // User Management
  'view_users': ['SUPER_ADMIN', 'SUPERVISOR', 'CONTENT_EDITOR', 'SUPPORT_AGENT'],
  'ban_users': ['SUPER_ADMIN', 'SUPERVISOR'],
  'suspend_users': ['SUPER_ADMIN', 'SUPERVISOR'],
  'delete_users': ['SUPER_ADMIN'],
  
  // Profile Management
  'approve_profiles': ['SUPER_ADMIN', 'SUPERVISOR', 'CONTENT_EDITOR'],
  'edit_profiles': ['SUPER_ADMIN', 'SUPERVISOR', 'CONTENT_EDITOR'],
  'delete_profiles': ['SUPER_ADMIN', 'SUPERVISOR'],
  
  // Admin Management
  'create_supervisor': ['SUPER_ADMIN'],
  'create_content_editor': ['SUPER_ADMIN', 'SUPERVISOR'],
  'create_support_agent': ['SUPER_ADMIN', 'SUPERVISOR'],
  'create_consultant': ['SUPER_ADMIN', 'SUPERVISOR'],
  
  // Subscription Management
  'upgrade_premium': ['SUPER_ADMIN', 'SUPERVISOR'],
  'downgrade_premium': ['SUPER_ADMIN', 'SUPERVISOR'],
  
  // System Settings
  'manage_global_settings': ['SUPER_ADMIN'],
  'view_analytics': ['SUPER_ADMIN'],
  'view_team_analytics': ['SUPER_ADMIN', 'SUPERVISOR'],
  
  // Support
  'handle_complaints': ['SUPER_ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT'],
  'mark_refunds': ['SUPER_ADMIN', 'SUPERVISOR', 'SUPPORT_AGENT'],
};
```

---

## 🔄 Role Upgrade/Downgrade Rules

### Who Can Change Roles:

| Current Role      | Can Be Changed To          | By Whom           |
|-------------------|----------------------------|-------------------|
| USER              | SUPPORT_AGENT              | SUPER_ADMIN, SUPERVISOR |
| USER              | CONTENT_EDITOR             | SUPER_ADMIN, SUPERVISOR |
| USER              | CONSULTANT                 | SUPER_ADMIN, SUPERVISOR |
| SUPPORT_AGENT     | CONTENT_EDITOR             | SUPER_ADMIN, SUPERVISOR |
| SUPPORT_AGENT     | USER (demotion)            | SUPER_ADMIN, SUPERVISOR |
| CONTENT_EDITOR    | SUPERVISOR                 | SUPER_ADMIN only |
| CONTENT_EDITOR    | SUPPORT_AGENT (demotion)   | SUPER_ADMIN, SUPERVISOR |
| SUPERVISOR        | CONTENT_EDITOR (demotion)  | SUPER_ADMIN only |
| SUPERVISOR        | SUPER_ADMIN                | No one (must be done manually in DB) |
| SUPER_ADMIN       | Any role (demotion)        | No one (cannot demote) |

---

## 🛡️ Security Rules

1. **No Self-Role Changes**: Users cannot change their own role
2. **Cannot Promote Above Self**: Supervisor cannot create another Supervisor
3. **Super Admin Protection**: Cannot demote or delete Super Admin accounts
4. **Audit Everything**: All role changes must be logged
5. **Two-Factor for Critical Actions**: Ban, Delete, Role Change should require confirmation

---

## 📌 Business Logic Notes

- **Premium Upgrades**: Only Supervisor+ can upgrade to premium (prevents abuse)
- **Ban Authority**: Only Supervisor+ can ban (separates content moderation from punishment)
- **Refund Process**: Support Agent marks status, actual refund done offline (security)
- **Profile Editing**: Content Editors can edit but not delete (prevents data loss)
- **Consultant Role**: Deferred to post-MVP (complex matchmaking workflows)

---

This reference will be updated as we implement each feature! 🚀
