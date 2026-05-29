---
name: project-design-system
description: Brand colors, typography, CSS variable architecture, and component class API for MarketingByPrince
metadata:
  type: project
---

## CSS Architecture

Single source of truth: **`src/styles/variables.css`** defines all `:root` custom properties.  
`src/index.css` `@import`s it first, then declares Tailwind directives and all component/utility layers.

**Never define `:root` tokens outside `src/styles/variables.css`.**

### File map
| File | Role |
|---|---|
| `src/styles/variables.css` | All CSS custom properties (`:root`) |
| `src/index.css` | Tailwind + `@layer base/components/utilities` |
| `src/styles/components.css` | Non-Tailwind component helpers (section-headline, deliverables list) |
| `src/styles/typography.css` | Google Fonts import + heading scale classes |
| `src/styles/utilities.css` | Project-only helpers not in Tailwind |
| `src/styles/print.css` | Print/PDF page layout |

## Brand

- Primary accent: `--accent` `#FF6933` (orange)
- Accent dark: `--accent-dark` `#E8582A`
- Font: Raleway (300–900)

## Token groups

**Colours** — `--accent`, `--accent-dark`, `--accent-muted`, `--accent-border`, `--accent-ring`  
**Light theme** — `--color-text`, `--color-text-2`, `--color-text-3`, `--color-muted`, `--color-subtle`, `--color-bg`, `--color-white`, `--color-border`, `--color-border-2`  
**Admin dark** — `--admin-bg`, `--admin-surface`, `--admin-border`, `--admin-text`, `--admin-muted`  
**Shadows** — `--shadow-sm/md/lg/xl`, `--shadow-accent`, `--shadow-accent-lg`  
**Radii** — `--radius-sm` (6px), `--radius-md` (10px), `--radius` (12px), `--radius-lg` (16px), `--radius-xl` (24px)  
**Spacing** — `--space-xs` (6px) → `--space-xl` (48px)  
**Transitions** — `--transition-fast` (150ms ease), `--transition-normal` (200ms ease)  
**Typography** — `--size-display`, `--size-pkg-title`, `--size-price`, `--size-section-head`, `--size-body`, `--size-body-sm`

## Theme split

- Public site: light theme (white/`--color-bg` backgrounds, `--color-text` text)
- Admin panel: dark theme (`--admin-bg`/`--admin-surface` backgrounds, `--admin-text` text)
