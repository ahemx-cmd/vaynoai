# Security Hardening Implementation Plan

## 🔴 Critical Issues Found (Top 10 Attack Vectors)

### 1. **Webhook Signature Not Verified** - CRITICAL ❌
- `lemon-squeezy-webhook` only checks if signature header EXISTS, doesn't verify it
- Attackers can send fake payment events to grant themselves unlimited credits
- **Status: WILL FIX**

### 2. **Guest Campaign Data Publicly Accessible** - HIGH ❌
- RLS allows anyone to view all guest campaigns (user_id IS NULL)
- Competitors can scrape all marketing content and strategies
- **Status: WILL FIX**

### 3. **Guest Campaign Hijacking** - HIGH ❌
- Any authenticated user can claim/update guest campaigns
- Attackers can steal other users' work before they sign up
- **Status: WILL FIX**

### 4. **User IDs Exposed in Campaign Shares** - MEDIUM ❌
- `campaign_shares` table is fully readable, exposing `created_by` UUIDs
- Enables user enumeration attacks
- **Status: WILL FIX**

### 5. **No Rate Limiting on Public Endpoints** - HIGH ❌
- Unlimited campaign creation enables resource abuse
- No IP or user-based throttling on any edge function
- **Status: WILL FIX** (Create rate limiting utility)

### 6. **Email Sequences Publicly Accessible** - HIGH ❌
- Complete marketing email content exposed for guest campaigns
- **Status: WILL FIX** (Part of RLS fix)

### 7. **Translate Campaign Lacks Schema Validation** - MEDIUM ❌
- No Zod validation, only presence checks
- Potential injection or malformed data attacks
- **Status: WILL FIX**

### 8. **Reset Monthly Credits Has No Auth** - LOW ⚠️
- Should only be callable by cron/admin
- Currently any request can trigger it
- **Status: WILL FIX**

### 9. **Guest Campaign Limit Bypassable** - MEDIUM ⚠️
- localStorage check can be cleared by user
- Unlimited free generations possible
- **Status: PARTIALLY FIXED** (Edge function already limits, but localStorage is client-side)

### 10. **Missing Input Length Limits in translate-campaign** - LOW ⚠️
- No max length on targetLanguage
- **Status: WILL FIX**

---

## Implementation Steps

### Step 1: Create Rate Limiting Utility
- Create `supabase/functions/_shared/rate-limit.ts` with IP + user tracking
- Use KV-like pattern with in-memory rate limiting (stateless per instance)

### Step 2: Fix Webhook Signature Verification
- Implement HMAC-SHA256 signature verification for LemonSqueezy

### Step 3: Add Zod Validation to translate-campaign
- Strict schema with UUID for campaignId, ISO language codes

### Step 4: Fix RLS Policies via Migration
- Remove guest campaign public access
- Add session-based guest campaign access (require claim token)
- Restrict campaign_shares to token-based access only

### Step 5: Add Rate Limiting to Edge Functions
- generate-campaign: 5 per hour per IP (guest), 20 per hour (authenticated)
- improve-email: 30 per hour per user
- translate-campaign: 10 per hour per user

### Step 6: Secure reset-monthly-credits
- Add secret header verification for cron jobs

---

## Files to Modify
1. `supabase/functions/lemon-squeezy-webhook/index.ts` - Signature verification
2. `supabase/functions/translate-campaign/index.ts` - Add Zod validation
3. `supabase/functions/reset-monthly-credits/index.ts` - Add cron secret
4. `supabase/functions/generate-campaign/index.ts` - Add rate limiting
5. `supabase/functions/improve-email/index.ts` - Add rate limiting
6. Database migration - Fix RLS policies

Do you approve this security hardening plan?