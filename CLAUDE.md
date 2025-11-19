# CLAUDE.md - AI Assistant Guide for Atlantis E-commerce Platform

**Last Updated:** 2025-11-19
**Project:** Atlantis/Anaqti E-commerce Platform (منصة أتلانتس للتجارة الإلكترونية)
**Status:** Production-Ready
**Branch:** `claude/claude-md-mi5pqwpu36uve5au-014k17sXVHCqo3yhkh3ERo3C`

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Architecture](#codebase-architecture)
3. [Development Workflows](#development-workflows)
4. [Key Conventions](#key-conventions)
5. [Critical Patterns](#critical-patterns)
6. [Testing Strategy](#testing-strategy)
7. [Security Considerations](#security-considerations)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### What is Atlantis?

Atlantis (أتلانتس) is a comprehensive e-commerce platform designed for the Saudi Arabian market with:

- **Multi-store architecture** - Merchants, affiliates, and marketers can create their own stores
- **Affiliate marketing system** - Complete commission tracking and gamification
- **Multi-language support** - Full Arabic/English with RTL/LTR layouts
- **Advanced theming** - 12+ themes with glass morphism, luxury gradients, and Persian heritage designs
- **Gamification** - Points, levels (Bronze, Silver, Gold, Legendary), alliances, and leaderboards
- **Progressive Web App** - Offline support, installable, optimized for mobile

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (component library)
- Framer Motion (animations)
- React Three Fiber (3D hero scenes)
- React Query (data fetching)
- React Router v6 (routing)

**Backend:**
- Supabase (database, auth, storage)
- Supabase Edge Functions (serverless functions)
- PostgreSQL (database)
- Row Level Security (RLS policies)

**External Services:**
- Firebase (authentication fallback)
- Geidea (payment gateway)
- AgentOps (monitoring)

### Project Stats

- **840** TypeScript/TSX files
- **378** reusable UI components
- **120** page components
- **102** custom React hooks
- **12+** theme configurations
- **25** active users in test data
- **152+** products in catalog
- **14** Supabase Edge Functions

---

## 🏗️ Codebase Architecture

### Directory Structure

```
sawal-shamel/
├── src/
│   ├── components/          # Reusable UI components (378 components)
│   │   ├── ui/              # Base shadcn/ui components (70+ components)
│   │   ├── design-system/   # Unified design system components
│   │   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   │   ├── store/           # Store-specific components
│   │   └── ...              # Domain-specific component groups
│   ├── pages/               # Route-based page components (120 pages)
│   │   ├── home/            # Role-based home pages (Admin, Marketer)
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── affiliate/       # Affiliate/marketer pages
│   │   ├── merchant/        # Merchant dashboard pages
│   │   ├── customer/        # Customer-facing pages
│   │   ├── storefront/      # Public storefront pages
│   │   └── ...
│   ├── hooks/               # Custom React hooks (102 hooks)
│   │   ├── useTheme.ts      # Theme management
│   │   ├── useFastAuth.ts   # Authentication
│   │   ├── useAdmin*.ts     # Admin-specific hooks
│   │   └── ...
│   ├── contexts/            # React Context providers
│   │   ├── ThemeProvider.tsx
│   │   ├── LanguageContext.tsx
│   │   ├── FirebaseAuthContext.tsx
│   │   └── CustomerAuthContext.tsx
│   ├── providers/           # Additional providers
│   ├── layouts/             # Page layouts
│   │   ├── AppShell.tsx     # Main app shell
│   │   ├── AdminLayout.tsx
│   │   ├── AffiliateLayout.tsx
│   │   └── MerchantLayout.tsx
│   ├── lib/                 # External library integrations
│   ├── utils/               # Utility functions
│   ├── services/            # Business logic and API services
│   ├── themes/              # Theme configurations
│   │   ├── default/
│   │   ├── luxury/
│   │   ├── damascus/
│   │   ├── ferrari/
│   │   └── ...
│   ├── styles/              # Global styles
│   │   ├── design-system.css
│   │   └── ...
│   └── integrations/        # External service integrations
├── supabase/
│   ├── functions/           # Edge Functions (14 functions)
│   │   ├── create-geidea-session/
│   │   ├── process-affiliate-order/
│   │   ├── fraud-detection/
│   │   └── ...
│   └── migrations/          # Database migrations
├── sql/                     # SQL schema files
│   ├── 01_policies.sql      # RLS policies
│   ├── 02_indexes.sql       # Database indexes
│   ├── 03_commissions_pipeline.sql
│   ├── 04_points_leaderboard.sql
│   └── 05_internal_inventory.sql
├── public/                  # Static assets
│   ├── models/              # 3D models for hero scenes
│   └── themes/              # Theme-specific assets
├── tests/                   # Test files
├── agentops/               # AgentOps integration
└── docs/                    # Documentation (if exists)
```

### Key Architecture Patterns

#### 1. **Provider Hierarchy**

The app uses a specific provider order (from outer to inner):

```tsx
ErrorBoundary
  → QueryClientProvider (React Query)
    → TooltipProvider
      → ThemeProvider (theme switching)
        → SupabaseAuthProvider (Supabase auth)
          → FirebaseAuthProvider (Firebase auth fallback)
            → LanguageProvider (i18n, RTL/LTR)
              → DarkModeProvider (light/dark mode)
                → UserDataProvider (user profile caching)
                  → AdaptiveLayoutProvider (responsive layout)
                    → BrowserRouter (routing)
                      → CustomerAuthProvider (customer-specific auth)
```

**IMPORTANT:** Never change this order! Each provider may depend on the ones above it.

#### 2. **Routing Structure**

The app uses role-based routing with protected routes:

```typescript
// Public routes
/                          → HomePage (marketing landing)
/auth                      → AuthPage (login/signup)
/ui                        → UI Showcase
/:storeSlug               → Public storefront for affiliate stores

// Protected routes by role
/affiliate/*              → Affiliate/Marketer dashboard (requires: affiliate, marketer)
/admin/*                  → Admin dashboard (requires: admin)
/merchant/*               → Merchant dashboard (requires: merchant)

// Shared protected routes
/profile                  → User profile (all authenticated users)
/notifications            → Notifications center (all authenticated users)
/checkout                 → Checkout page (customers)
/order/confirmation       → Order confirmation
```

**Key files:**
- `src/App.tsx` - Main routing configuration
- `src/shared/components/ProtectedRoute.tsx` - Role-based route guard
- `src/hooks/getHomeRouteForRole.ts` - Determines home route based on user role

#### 3. **State Management**

The project uses multiple state management approaches:

**Global State:**
- React Context for theme, language, auth, user data
- React Query for server state (5-minute stale time, 1 retry)
- localStorage for theme, language, user preferences

**Local State:**
- React hooks (`useState`, `useReducer`)
- Zustand stores for specific features (admin analytics, orders)

**Example Zustand store pattern:**
```typescript
// src/hooks/useAdminOrders.ts
export const useAdminOrders = create<AdminOrdersState>((set, get) => ({
  // State
  orders: [],
  isLoading: false,

  // Actions
  fetchOrders: async () => { /* ... */ },
  refreshOrders: () => { /* ... */ },
}));
```

#### 4. **Theme System**

**CRITICAL:** The theme system is the most complex part of the architecture. Follow these rules strictly:

**Theme Definition Structure:**
```
src/themes/<theme-id>/
  ├── index.ts           # Theme config (colors, metadata)
  ├── tokens.css         # CSS custom properties
  └── theme.json         # Additional theme data (optional)
```

**Theme Registration:**
```typescript
// src/themes/registry.ts
export const THEMES = {
  'default': defaultTheme,
  'luxury': luxuryTheme,
  'damascus': damascusTheme,
  // ...
};
```

**Theme Switching:**
```tsx
import { useTheme } from '@/hooks/useTheme';

const { themeId, setThemeId } = useTheme();
setThemeId('luxury'); // Switches theme
```

**CSS Variable Usage (ALWAYS use semantic tokens):**
```css
/* ✅ CORRECT - Uses semantic tokens */
.my-component {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}

/* ❌ WRONG - Hardcoded colors */
.my-component {
  background: #ffffff;
  color: #000000;
}
```

**Available Semantic Tokens:**
- `--background`, `--foreground` - Main page colors
- `--card`, `--card-foreground` - Card backgrounds
- `--primary`, `--primary-fg` - Primary brand color
- `--secondary`, `--secondary-fg` - Secondary color
- `--accent`, `--accent-fg` - Accent highlights
- `--muted`, `--muted-foreground` - Subdued elements
- `--border`, `--input`, `--ring` - Borders and inputs
- `--success`, `--warning`, `--danger`, `--info` - Status colors
- `--luxury`, `--premium`, `--persian` - Special themed colors

**Tailwind Classes (ALWAYS use these):**
```tsx
// ✅ CORRECT
<div className="bg-card text-card-foreground border-border">

// ❌ WRONG
<div className="bg-white text-black border-gray-200">
```

**Gradient System:**
```tsx
// ✅ CORRECT - Uses gradient utilities
<div className="bg-gradient-luxury">

// ✅ CORRECT - Uses helper function
import { getGradientClasses } from '@/utils/themeHelpers';
<div className={getGradientClasses('premium')}>

// ❌ WRONG - Inline gradients
<div style={{ background: 'linear-gradient(...)' }}>
```

#### 5. **Component Architecture**

Components follow a three-tier structure:

**Tier 1: Base UI Components** (`src/components/ui/`)
- shadcn/ui components (Button, Card, Dialog, Input, etc.)
- Highly reusable, no business logic
- Use semantic tokens exclusively

**Tier 2: Design System Components** (`src/components/design-system/`)
- UnifiedButton, UnifiedCard
- Standardized variants and animations
- Built on top of base components

**Tier 3: Feature Components** (`src/components/...`)
- Domain-specific logic
- Can use hooks, contexts
- Examples: OrderTable, ProductCard, AdminRecentOrdersTable

**Example component structure:**
```tsx
// src/components/admin/OrderTable.tsx
import { Card } from '@/components/ui/card';
import { useAdminOrders } from '@/hooks/useAdminOrders';

export function OrderTable() {
  const { orders, isLoading } = useAdminOrders();

  return (
    <Card className="bg-card text-card-foreground">
      {/* Component content */}
    </Card>
  );
}
```

#### 6. **Internationalization (i18n)**

The app supports Arabic (default) and English:

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language, setLanguage, t, direction } = useLanguage();

  return (
    <div dir={direction}> {/* 'rtl' for Arabic, 'ltr' for English */}
      <h1>{t('welcome')}</h1>
      <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}>
        {t('switchLanguage')}
      </button>
    </div>
  );
}
```

**IMPORTANT:** Always test UI in both RTL and LTR modes.

---

## 🔧 Development Workflows

### Setting Up Local Development

```bash
# 1. Clone the repository
git clone <repo-url>
cd sawal-shamel

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Start development server
npm run dev
# Server runs at http://localhost:8080
```

### Branch Workflow

**CRITICAL:** Always work on the correct branch:

```bash
# Current working branch
git checkout claude/claude-md-mi5pqwpu36uve5au-014k17sXVHCqo3yhkh3ERo3C

# Create new feature branch from current
git checkout -b claude/feature-name-<session-id>

# Push to remote
git push -u origin <branch-name>
```

**NEVER:**
- Push to `main` directly
- Create branches not prefixed with `claude/`
- Push without the `-u origin` flag on first push

### Making Changes

#### 1. **File Reading**
```bash
# Always read files before editing
# Use Read tool, not cat command
```

#### 2. **Code Changes**
- **ALWAYS** preserve existing code patterns
- **NEVER** remove functionality without explicit permission
- **USE** the Edit tool for modifications
- **FOLLOW** existing naming conventions

#### 3. **Testing Changes**
```bash
# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

#### 4. **Committing**

**Commit Message Format:**
```
<type>: <description in Arabic or English>

Examples:
✨ إضافة نظام الإشعارات الجديد
🐛 إصلاح خطأ في حساب العمولات
♻️ إعادة هيكلة مكونات الثيم
🎨 تحسين تصميم صفحة الدفع
```

**Commit Types:**
- ✨ (feature) - New feature
- 🐛 (fix) - Bug fix
- ♻️ (refactor) - Code refactoring
- 🎨 (style) - UI/styling changes
- 📝 (docs) - Documentation
- 🔒 (security) - Security fixes
- ⚡ (perf) - Performance improvements

**Git Commands:**
```bash
# Stage files
git add <files>

# Commit with message
git commit -m "$(cat <<'EOF'
✨ إضافة ميزة جديدة
- تفاصيل التغيير الأول
- تفاصيل التغيير الثاني
EOF
)"

# Push to remote (with retry on network errors)
git push -u origin <branch-name>
```

### Creating Pull Requests

```bash
# 1. Ensure branch is up to date
git fetch origin
git pull origin <branch-name>

# 2. Push latest changes
git push -u origin <branch-name>

# 3. Create PR using gh CLI
gh pr create --title "Title" --body "$(cat <<'EOF'
## Summary
- Change 1
- Change 2

## Test plan
- [ ] Test step 1
- [ ] Test step 2
EOF
)"
```

---

## 🎨 Key Conventions

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `OrderTable.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAdminOrders.ts`)
- Utils: `camelCase.ts` (e.g., `themeHelpers.ts`)
- Pages: `PascalCase.tsx` (e.g., `AdminHome.tsx`)
- Contexts: `PascalCase.tsx` with `Context` suffix (e.g., `ThemeContext.tsx`)

**Variables:**
- React components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- CSS classes: `kebab-case` or Tailwind utilities

**Database:**
- Tables: `snake_case` (e.g., `user_profiles`, `affiliate_stores`)
- Columns: `snake_case` (e.g., `created_at`, `user_id`)
- Foreign keys: `<table>_id` (e.g., `profile_id`, `store_id`)

### Code Style

**TypeScript:**
```typescript
// ✅ CORRECT - Export named components
export function MyComponent() { }

// ✅ CORRECT - Use TypeScript types
interface MyProps {
  title: string;
  count?: number;
}

// ✅ CORRECT - Destructure props
export function MyComponent({ title, count = 0 }: MyProps) { }

// ❌ WRONG - Default exports (except for lazy-loaded pages)
export default MyComponent;

// ❌ WRONG - Any types
function process(data: any) { }
```

**React Patterns:**
```tsx
// ✅ CORRECT - Early returns for loading/error states
export function MyComponent() {
  const { data, isLoading, error } = useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;

  return <div>{/* Main content */}</div>;
}

// ✅ CORRECT - Semantic HTML and ARIA
<button
  aria-label="Close dialog"
  onClick={handleClose}
  className="bg-primary text-primary-foreground"
>
  Close
</button>

// ❌ WRONG - Div soup
<div onClick={handleClose}>Close</div>
```

**CSS/Tailwind:**
```tsx
// ✅ CORRECT - Semantic tokens
<div className="bg-card text-card-foreground border-border rounded-lg shadow-soft">

// ✅ CORRECT - Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ✅ CORRECT - Dark mode support (handled by themes)
<div className="bg-background text-foreground">

// ❌ WRONG - Hardcoded colors
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

### Import Organization

```typescript
// 1. External imports
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal absolute imports (using @ alias)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 3. Hooks
import { useTheme } from '@/hooks/useTheme';
import { useFastAuth } from '@/hooks/useFastAuth';

// 4. Utils and helpers
import { cn } from '@/lib/utils';
import { getGradientClasses } from '@/utils/themeHelpers';

// 5. Types
import type { ThemeConfig } from '@/themes/types';

// 6. Relative imports (use sparingly)
import { LocalComponent } from './LocalComponent';
```

### Comment Style

```typescript
// ✅ GOOD - Explains WHY, not WHAT
// Retry payment processing because Geidea webhooks can arrive out of order
await retryPayment();

// ✅ GOOD - Documents complex business logic
/**
 * Calculates affiliate commission based on tier level:
 * - Bronze: 5%
 * - Silver: 7%
 * - Gold: 10%
 * - Legendary: 15%
 */
function calculateCommission(amount: number, tier: string): number { }

// ❌ BAD - States the obvious
// Set the variable to true
const isActive = true;
```

---

## 🔑 Critical Patterns

### Authentication Flow

The app uses a **dual authentication system**:

1. **Supabase Auth** (primary) - For platform users (admin, affiliates, merchants)
2. **Firebase Auth** (fallback) - Legacy support
3. **Customer Auth** (OTP-based) - For customers/shoppers

```tsx
// Get current user
import { useFastAuth } from '@/hooks/useFastAuth';

function MyComponent() {
  const { user, userRole, loading } = useFastAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return <div>Welcome {user.email}</div>;
}
```

**User Roles:**
- `admin` - Platform administrator
- `merchant` - Product seller/store owner
- `affiliate` - Affiliate marketer
- `marketer` - Same as affiliate (legacy)
- `customer` - End customer/shopper

**CRITICAL:** Never allow users to self-assign `admin` role!

### Data Fetching

**Use React Query for all server data:**

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Fetching data
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutating data
function useCreateProduct() {
  return useMutation({
    mutationFn: async (product: NewProduct) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

### Error Handling

**Always handle errors gracefully:**

```tsx
import { toast } from 'sonner';

function MyComponent() {
  const { mutate, isPending } = useMutation({
    mutationFn: async (data) => { /* ... */ },
    onSuccess: (data) => {
      toast.success('تم الحفظ بنجاح', {
        description: 'تم حفظ التغييرات',
      });
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('حدث خطأ', {
        description: error.message || 'حاول مرة أخرى',
      });
    },
  });

  return (
    <Button onClick={() => mutate(data)} disabled={isPending}>
      {isPending ? 'جاري الحفظ...' : 'حفظ'}
    </Button>
  );
}
```

### Responsive Design

**Mobile-first approach with breakpoints:**

```tsx
// Tailwind breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1400px

<div className="
  grid
  grid-cols-1       // Mobile: 1 column
  md:grid-cols-2    // Tablet: 2 columns
  lg:grid-cols-3    // Desktop: 3 columns
  gap-4
">
  {/* Grid items */}
</div>
```

**Device Detection Hook:**

```tsx
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useDeviceDetection();

  if (isMobile) return <MobileLayout />;
  if (isTablet) return <TabletLayout />;
  return <DesktopLayout />;
}
```

### Performance Optimization

**Code Splitting:**
```tsx
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function MyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

**Memoization:**
```tsx
import { useMemo, useCallback } from 'react';

function MyComponent({ items }) {
  // Memoize expensive calculations
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.price - b.price),
    [items]
  );

  // Memoize callbacks
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return <div>{/* ... */}</div>;
}
```

**Image Optimization:**
```tsx
// Use lazy loading for images
<img
  src={imageUrl}
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
/>
```

---

## 🧪 Testing Strategy

### Current Testing Setup

The project uses Node.js built-in test runner:

```bash
# Run tests
npm test

# Run specific test file
node --loader ./tests/ts-loader.mjs --test tests/my-test.test.ts
```

### Test File Locations

```
tests/
  ├── profile.*              # Profile page tests
  ├── notifications.*        # Notifications tests
  ├── admin.*               # Admin dashboard tests
  ├── a11y.keyboard.nav.test.js  # Accessibility tests
  └── ...
```

### Writing Tests

**Example test structure:**
```typescript
import { test, describe, mock } from 'node:test';
import assert from 'node:assert';

describe('MyComponent', () => {
  test('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' };

    // Act
    const result = render(<MyComponent {...props} />);

    // Assert
    assert.strictEqual(result.exists, true);
  });

  test('should handle click events', () => {
    // Test implementation
  });
});
```

### Testing Checklist

When making changes, ensure you test:

- ✅ Component renders without errors
- ✅ Props are handled correctly
- ✅ User interactions work (clicks, form submissions)
- ✅ Error states display properly
- ✅ Loading states work
- ✅ Data fetching succeeds
- ✅ Theme switching works (test in all themes)
- ✅ RTL/LTR layouts work
- ✅ Mobile/tablet/desktop responsive views
- ✅ Keyboard navigation works
- ✅ Screen reader compatibility (basic)

### Manual Testing Routes

**Admin Testing:**
```
/admin/dashboard          → Admin home
/admin/orders            → Orders management
/admin/analytics         → Analytics dashboard
/admin/customers         → Customer management
/admin/leaderboard       → Affiliate leaderboard
/admin/inventory         → Inventory management
```

**Affiliate Testing:**
```
/affiliate               → Affiliate home
/affiliate/store/settings → Store settings
/products-browser        → Browse products to add to store
/affiliate/analytics     → Commission analytics
```

**Public Testing:**
```
/                        → Homepage
/affiliate-store/[slug]  → Public storefront
/checkout                → Checkout page
/order/confirmation      → Order confirmation
```

---

## 🔒 Security Considerations

### CRITICAL Security Rules

**1. NEVER commit sensitive data:**
```bash
# ❌ NEVER commit these files
.env
.env.local
credentials.json
serviceAccount.json

# ✅ Always use .env.example as template
```

**2. NEVER allow admin self-registration:**
```tsx
// ❌ WRONG - Allows anyone to become admin
<SelectItem value="admin">Admin</SelectItem>

// ✅ CORRECT - Admin removed from public signup
// Admins are created manually by Super Admin
```

**3. ALWAYS validate user roles:**
```tsx
// ✅ CORRECT - Check role before sensitive operations
if (userRole !== 'admin') {
  throw new Error('Unauthorized');
}
```

**4. ALWAYS use CORS properly in Edge Functions:**
```typescript
// ❌ WRONG - Allows any origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
};

// ✅ CORRECT - Use allowed origins
import { getCorsHeaders } from '../_shared/cors.ts';
const corsHeaders = getCorsHeaders(req);
```

**5. NEVER expose API keys in frontend:**
```tsx
// ❌ WRONG - API key in code
const API_KEY = 'sk_live_123456';

// ✅ CORRECT - Use environment variables
const API_KEY = import.meta.env.VITE_API_KEY;
```

### Row Level Security (RLS)

All database tables use RLS policies. When querying:

```sql
-- Example RLS policy
CREATE POLICY "Users can only see their own orders"
ON orders FOR SELECT
USING (profile_id = auth.uid());
```

**CRITICAL:** Never bypass RLS in application code!

### Input Validation

**Always validate and sanitize inputs:**

```tsx
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  description: z.string().optional(),
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(productSchema),
  });

  // Form will validate automatically
}
```

### Security Audit Results

**Last Audit:** 2025-11-17

**Fixed Issues:**
- ✅ CORS wildcard in Edge Functions (14/14 fixed)
- ✅ Admin self-registration removed
- ✅ Commission calculation bug fixed
- ✅ Column naming conflicts fixed

**See:** `SECURITY_AUDIT.md` for full details

---

## 📚 Common Tasks

### Task 1: Add a New Theme

```bash
# 1. Create theme directory
mkdir -p src/themes/my-theme

# 2. Create theme files
touch src/themes/my-theme/index.ts
touch src/themes/my-theme/tokens.css

# 3. Define theme (index.ts)
cat > src/themes/my-theme/index.ts << 'EOF'
import type { ThemeConfig } from '../types';

export const myTheme: ThemeConfig = {
  id: 'my-theme',
  name: 'My Theme',
  colors: {
    primary: 'hsl(280, 80%, 60%)',
    secondary: 'hsl(200, 70%, 50%)',
    // ... other colors
  },
};
EOF

# 4. Define CSS tokens (tokens.css)
cat > src/themes/my-theme/tokens.css << 'EOF'
[data-theme="my-theme"] {
  --background: 0 0% 100%;
  --foreground: 0 0% 10%;
  --primary: 280 80% 60%;
  /* ... other variables */
}
EOF

# 5. Register theme
# Edit src/themes/registry.ts and add:
# import { myTheme } from './my-theme';
# export const THEMES = {
#   ...existing,
#   'my-theme': myTheme,
# };

# 6. Import in main CSS
# Edit src/index.css and add:
# @import './themes/my-theme/tokens.css';
```

### Task 2: Add a New Page

```bash
# 1. Create page component
cat > src/pages/MyNewPage.tsx << 'EOF'
import { Card } from '@/components/ui/card';

export default function MyNewPage() {
  return (
    <div className="container mx-auto p-6">
      <Card className="bg-card text-card-foreground">
        <h1 className="text-2xl font-bold">My New Page</h1>
      </Card>
    </div>
  );
}
EOF

# 2. Add route in App.tsx
# Import the page:
# const MyNewPage = lazy(() => import('./pages/MyNewPage'));
#
# Add route:
# <Route path="/my-new-page" element={<MyNewPage />} />
```

### Task 3: Add a New Component

```bash
# 1. Create component file
cat > src/components/MyComponent.tsx << 'EOF'
import { Card } from '@/components/ui/card';

interface MyComponentProps {
  title: string;
  description?: string;
}

export function MyComponent({ title, description }: MyComponentProps) {
  return (
    <Card className="bg-card text-card-foreground p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </Card>
  );
}
EOF

# 2. Use in page
# import { MyComponent } from '@/components/MyComponent';
# <MyComponent title="Hello" description="World" />
```

### Task 4: Add a Custom Hook

```bash
# 1. Create hook file
cat > src/hooks/useMyHook.ts << 'EOF'
import { useState, useEffect } from 'react';

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [value]);

  return { value, setValue };
}
EOF

# 2. Use in component
# import { useMyHook } from '@/hooks/useMyHook';
# const { value, setValue } = useMyHook('initial');
```

### Task 5: Add Database Migration

```bash
# 1. Create migration file
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_my_migration.sql

# 2. Write SQL
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_my_migration.sql << 'EOF'
-- Add new column
ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false;

-- Create index
CREATE INDEX idx_products_featured ON products(featured);
EOF

# 3. Apply migration
# Via Supabase Dashboard or CLI:
# supabase db push
```

### Task 6: Fix Theme Issues

**Symptoms:** Colors don't change when switching themes

**Solution:**
```tsx
// ❌ WRONG - Hardcoded color
<div className="bg-white text-black">

// ✅ CORRECT - Semantic token
<div className="bg-background text-foreground">

// ❌ WRONG - Direct gradient
<div className="bg-gradient-to-r from-purple-500 to-pink-500">

// ✅ CORRECT - Theme gradient
<div className="bg-gradient-premium">
```

**Check:** `THEME_SYSTEM_GUIDE.md` for complete guide

---

## 🔧 Troubleshooting

### Issue: "Cannot find module '@/...'"

**Cause:** TypeScript path alias not configured

**Solution:**
```json
// Ensure tsconfig.json has:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Theme not applying

**Cause:** CSS variables not loaded or theme not registered

**Solution:**
```bash
# 1. Check theme is registered
grep 'my-theme' src/themes/registry.ts

# 2. Check CSS imported
grep 'my-theme' src/index.css

# 3. Clear browser cache and rebuild
rm -rf node_modules/.vite
npm run dev
```

### Issue: Supabase "permission denied"

**Cause:** RLS policy blocking access

**Solution:**
```sql
-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Add policy for authenticated users
CREATE POLICY "Users can read their own data"
ON your_table FOR SELECT
USING (auth.uid() = user_id);
```

### Issue: Build fails with "chunk size warning"

**Cause:** Large dependencies in single chunk

**Solution:**
Already configured in `vite.config.ts`:
```typescript
build: {
  chunkSizeWarningLimit: 1024,
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('three')) return 'three';
        if (id.includes('@supabase')) return 'supabase';
        // ...
      },
    },
  },
}
```

### Issue: "Too many re-renders" error

**Cause:** Infinite loop in `useEffect` or state updates

**Solution:**
```tsx
// ❌ WRONG - Missing dependencies
useEffect(() => {
  fetchData();
}, []); // fetchData not in dependencies

// ✅ CORRECT - Include all dependencies
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ BETTER - Use useCallback
const fetchData = useCallback(() => {
  // fetch logic
}, [/* dependencies */]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### Issue: Components not updating after data change

**Cause:** React Query cache not invalidated

**Solution:**
```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// After mutation, invalidate related queries
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['products'] });
}
```

---

## 📖 Additional Resources

### Documentation Files

- `README.md` - Project overview and setup
- `DESIGN_SYSTEM_GUIDE.md` - Design system components and utilities
- `THEME_SYSTEM_GUIDE.md` - Complete theme system guide
- `TESTING_GUIDE.md` - Testing strategy and test data
- `SECURITY_AUDIT.md` - Security audit report
- `MIGRATION_GUIDE.md` - Database migration guides

### External Documentation

- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase Docs](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest/docs/react/overview)

### Key Contacts

- Support: support@atlantis-platform.com
- Lovable Project: https://lovable.dev/projects/bcb1c4b5-98be-4432-b045-2bf9a24e6860

---

## 🎯 Quick Reference

### File Paths to Remember

```
Config Files:
  vite.config.ts              - Vite configuration
  tailwind.config.ts          - Tailwind configuration
  tsconfig.json               - TypeScript configuration
  package.json                - Dependencies and scripts

Entry Points:
  src/App.tsx                 - Main app component
  src/main.tsx                - App entry point
  src/index.css               - Global styles
  index.html                  - HTML entry

Key Providers:
  src/providers/ThemeProvider.tsx
  src/contexts/LanguageContext.tsx
  src/contexts/FirebaseAuthContext.tsx
  src/contexts/CustomerAuthContext.tsx

Routing:
  src/App.tsx                 - Route definitions
  src/shared/components/ProtectedRoute.tsx

Themes:
  src/themes/registry.ts      - Theme registration
  src/themes/*/tokens.css     - Theme CSS variables
  src/hooks/useTheme.ts       - Theme hook

Components:
  src/components/ui/          - Base components
  src/components/design-system/ - Unified components
  src/components/layout/      - Layout components

Database:
  sql/*.sql                   - SQL schemas
  supabase/migrations/*.sql   - Migrations
  supabase/functions/         - Edge functions
```

### Commands Cheat Sheet

```bash
# Development
npm run dev                   # Start dev server
npm run build                 # Build for production
npm run preview               # Preview production build
npm run lint                  # Run ESLint
npm test                      # Run tests

# Git
git status                    # Check status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push -u origin <branch>   # Push to remote

# Supabase (if CLI installed)
supabase db push              # Push migrations
supabase db reset             # Reset database
supabase functions deploy     # Deploy edge function
```

### Component Import Patterns

```typescript
// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';

// Design System
import { UnifiedButton } from '@/components/design-system';
import { UnifiedCard } from '@/components/design-system';

// Hooks
import { useTheme } from '@/hooks/useTheme';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useLanguage } from '@/contexts/LanguageContext';

// Utils
import { cn } from '@/lib/utils';
import { getGradientClasses } from '@/utils/themeHelpers';
```

---

**Remember:** When in doubt, read existing code to understand patterns. This codebase values consistency over cleverness!

**Last Updated:** 2025-11-19
**Maintainers:** Atlantis Development Team
**AI Assistant:** Claude (Anthropic)
