# Route Groups

Route groups allow you to organize your pages into logical groups without affecting the URL structure. This is similar to Next.js route groups and is particularly useful for organizing pages with different layouts or for future SSG configurations.

## Overview

Route groups are created by wrapping a folder name in parentheses: `(groupName)`. These folders are purely organizational and do not appear in the URL path.

## Example Structure

```
/src/pages/
  ├── (website)/
  │   ├── _layout.tsx      # Layout for website group
  │   ├── index.tsx        # → /
  │   ├── about.tsx        # → /about
  │   └── contact.tsx      # → /contact
  ├── (portal)/
  │   ├── _layout.tsx      # Layout for portal group
  │   ├── dashboard.tsx    # → /dashboard
  │   └── tasks.tsx        # → /tasks
  └── (auth)/
      ├── _layout.tsx      # Layout for auth group
      ├── login.tsx        # → /login
      └── register.tsx     # → /register
```

## Key Features

### URL Path Generation

Route groups are **stripped from the URL path**. For example:

- `/pages/(website)/contact.tsx` → `/contact`
- `/pages/(portal)/dashboard.tsx` → `/dashboard`
- `/pages/(auth)/login.tsx` → `/login`

The route group folder is invisible to the router and does not affect the final URL.

### Layouts

Each route group can have its own `_layout.tsx` file. **Layouts are isolated to their route group** - a layout in one group does not apply to pages in other groups:

```tsx
// /src/pages/(website)/_layout.tsx
export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="website-layout">
      <header>Website Header</header>
      <main>{children}</main>
      <footer>Website Footer</footer>
    </div>
  );
}
```

```tsx
// /src/pages/(portal)/_layout.tsx
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-layout">
      <nav>Portal Navigation</nav>
      <main>{children}</main>
    </div>
  );
}
```

### Dynamic Routes

Route groups work seamlessly with dynamic routes:

```
/src/pages/
  └── (portal)/
      ├── tasks/
      │   ├── [id].tsx     # → /tasks/:id
      │   └── index.tsx    # → /tasks
      └── users/
          └── [userId].tsx # → /users/:userId
```

### Nested Route Groups

You can nest folders inside route groups:

```
/src/pages/
  └── (portal)/
      ├── _layout.tsx
      ├── dashboard.tsx    # → /dashboard
      └── settings/
          ├── profile.tsx  # → /settings/profile
          └── security.tsx # → /settings/security
```

## Use Cases

### 1. Different Layouts for Different Sections

Organize pages that share the same layout:

```
(public)/     - Public website pages with marketing layout
(app)/        - Authenticated app pages with dashboard layout
(admin)/      - Admin pages with admin layout
(auth)/       - Authentication pages with minimal layout
```

### 2. SSG Organization (Future)

Group pages by their static generation requirements:

```
(static)/     - Fully static pages (SSG)
(dynamic)/    - Dynamic pages (SSR)
(hybrid)/     - Pages with ISR
```

### 3. Feature-Based Organization

Organize by feature or domain:

```
(blog)/       - All blog-related pages
(shop)/       - E-commerce pages
(docs)/       - Documentation pages
```

## Implementation Details

### Router Processing

The router processes route groups in the following order:

1. **File Discovery**: Scan all files in `/src/pages/**/*.{tsx,jsx,ts,js}`
2. **Layout Collection**: Identify `_layout.tsx` files and map them to their directory paths (including route groups)
3. **Route Generation**: Strip route groups from file paths to generate URL patterns
4. **Layout Association**: Associate layouts with routes based on the full directory path (including route groups)

### Pattern Matching

Route groups are removed using the following regex pattern:

```typescript
// Remove /(groupName) from the path
pattern = pattern.replace(/\/\([^)]+\)/g, "");
```

This ensures:
- `/(website)/contact` → `/contact`
- `/(portal)/tasks/[id]` → `/tasks/:id`
- `/pages/(auth)/login` → `/login`

### SSG Support

When generating static pages, route groups are also stripped from the output paths:

```typescript
// pages/(website)/about.tsx → /about.html
// pages/(portal)/dashboard.tsx → /dashboard.html
```

## Layout Hierarchy

Layouts follow a **hierarchical inheritance model** where:
1. **Root layout** (`/pages/_layout.tsx`) applies to **ALL pages** as the outermost wrapper
2. **Group layouts** apply only to pages within their specific group
3. **Nested folder layouts** apply only to pages within their folder

### Layout Resolution Order

Layouts are applied from **outer to inner** (root → group → nested folders):

```
/pages/
  ├── _layout.tsx                    # RootLayout - applies to ALL pages
  ├── index.tsx                      # [RootLayout]
  ├── about.tsx                      # [RootLayout]
  ├── (website)/
  │   ├── _layout.tsx                # WebsiteLayout - only (website) pages
  │   ├── contact.tsx                # [RootLayout → WebsiteLayout]
  │   └── blog/
  │       ├── _layout.tsx            # BlogLayout - only blog pages
  │       └── post.tsx               # [RootLayout → WebsiteLayout → BlogLayout]
  ├── (portal)/
  │   ├── _layout.tsx                # PortalLayout - only (portal) pages
  │   ├── dashboard.tsx              # [RootLayout → PortalLayout]
  │   └── settings/
  │       ├── _layout.tsx            # SettingsLayout - only settings pages
  │       └── profile.tsx            # [RootLayout → PortalLayout → SettingsLayout]
  └── admin/
      ├── _layout.tsx                # AdminLayout - only /admin/* pages
      └── users.tsx                  # [RootLayout → AdminLayout]
```

### How Layouts Wrap Components

For a page at `/pages/(portal)/dashboard/stats.tsx` with three layouts:

```tsx
// Rendered as:
<RootLayout>           {/* From /pages/_layout.tsx */}
  <PortalLayout>       {/* From /pages/(portal)/_layout.tsx */}
    <DashboardLayout>  {/* From /pages/(portal)/dashboard/_layout.tsx */}
      <StatsPage />
    </DashboardLayout>
  </PortalLayout>
</RootLayout>
```

### Key Principles

1. **Root Layout is Universal**: The root layout wraps ALL pages in your app, regardless of grouping
2. **Groups Isolate Layouts**: A layout in `(website)` never applies to `(portal)` pages
3. **Folders Scope Layouts**: Nested folder layouts only apply to their subtree
4. **Order Matters**: Layouts wrap from outermost (root) to innermost (deepest folder)

## Best Practices

1. **Use Root Layout for Global UI**: Put navigation, common headers/footers in `/pages/_layout.tsx`
2. **Use Group Layouts for Section-Specific UI**: Different authentication states, themes, or navigation per section
3. **Use Descriptive Group Names**: Choose names that clearly indicate their purpose (`(marketing)`, `(app)`, `(admin)`)
4. **Avoid Deep Nesting**: Keep route groups at a reasonable depth for maintainability
5. **Consider Layout Performance**: Each layout adds a wrapper component - use them purposefully

## Route Collision Detection

The router automatically detects when multiple files resolve to the same URL pattern and logs errors to help you identify conflicts:

```
❌ Route collision detected! Multiple files resolve to the same path "/":
   - /src/pages/index.tsx
   - /src/pages/(website)/index.tsx
Only the first file will be used. Consider using different file names or paths.
```

### Common Collision Scenarios

**Multiple index files in route groups:**
```
❌ /src/pages/index.tsx           → /
❌ /src/pages/(website)/index.tsx → /
```

**Same filename in different groups:**
```
❌ /src/pages/(website)/about.tsx → /about
❌ /src/pages/(portal)/about.tsx  → /about
```

**Mixed grouped and non-grouped files:**
```
❌ /src/pages/contact.tsx          → /contact
❌ /src/pages/(website)/contact.tsx → /contact
```

### How to Fix Collisions

1. **Use unique filenames** within each group
2. **Nest pages in subdirectories** to create unique paths
3. **Keep only one index.tsx** at the root level
4. **Use descriptive names** that reflect the page's purpose

### Detection Behavior

- Collisions are detected at **build time** during `npm run build` or `npm run dev`
- Warnings are logged to the console with file paths
- The **first file encountered** takes precedence (file system order)
- Subsequent colliding routes are still added but may never be matched
- Build continues successfully (warnings, not errors) to avoid blocking development

## Notes

- Route group folders MUST use parentheses: `(groupName)`
- Route groups do NOT appear in the final URL
- Each route group can have its own `_layout.tsx` file
- Route groups work with all page types: static, dynamic, and catch-all routes
- Multiple levels of route groups are supported, though not recommended for simplicity
- Route collisions are automatically detected and logged as errors
