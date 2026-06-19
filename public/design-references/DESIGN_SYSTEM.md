# Angle Enterprise — Design Reference

## Color Palette

| Role            | Hex       | Usage                                 |
|-----------------|-----------|---------------------------------------|
| Primary (Indigo)| `#6366F1` | CTAs, active states, links            |
| Primary Dark    | `#4F46E5` | Hover states                          |
| Primary Light   | `#818CF8` | Icons on dark bg, secondary accents   |
| Accent (Amber)  | `#F59E0B` | Highlights, tags, secondary CTAs      |
| Sidebar BG      | `#0F172A` | Sidebar background (Slate 900)        |
| Page BG         | `#F8FAFC` | Main content area background          |
| Card Surface    | `#FFFFFF` | All card backgrounds                  |
| Border          | `#E2E8F0` | Card / input borders                  |
| Text Primary    | `#0F172A` | Headings, main body                   |
| Text Secondary  | `#475569` | Labels, descriptions                  |
| Text Muted      | `#94A3B8` | Placeholders, timestamps              |
| Success         | `#10B981` | Positive changes, success toasts      |
| Error           | `#EF4444` | Errors, destructive actions           |
| Warning         | `#F59E0B` | Warnings (same as accent)             |
| Info            | `#3B82F6` | Informational badges                  |

## Typography

- **Font Family**: Inter (Google Fonts — loaded in `app/layout.jsx`)
- **Headings**: `font-bold` or `font-semibold`, `tracking-tight`
- **Body**: `text-sm` (14px), `text-[#0F172A]`
- **Labels**: `text-xs font-semibold uppercase tracking-wide text-[#475569]`
- **Muted**: `text-xs text-[#94A3B8]`

## Spacing Scale

Dashboard uses 6-unit grid (`p-6`, `gap-6`). Cards use `p-5`. Tight spacing: `gap-3`, `gap-2.5`.

## Border Radius

| Token        | Value     | Usage                |
|--------------|-----------|----------------------|
| `rounded-lg` | 0.5rem    | Badges, small chips  |
| `rounded-xl` | 0.75rem   | Buttons, inputs      |
| 0.875rem     | custom    | Cards                |
| `rounded-2xl`| 1rem      | Modals, panels       |

## Shadow System

| Level  | CSS                                                         | Usage       |
|--------|-------------------------------------------------------------|-------------|
| Card   | `0 2px 8px 0 rgb(99 102 241/0.06), 0 1px 3px 0 rgb(0/0.08)`| All cards   |
| Hover  | `0 8px 24px -4px rgb(0 0 0/0.1)`                            | Card hover  |
| Sidebar| `4px 0 24px 0 rgb(0 0 0/0.15)`                              | Sidebar     |
| Modal  | `0 25px 50px -12px rgb(0 0 0/0.25)`                         | Dialogs     |

## Reference Designs (Inspiration)

- **Vercel Dashboard** — clean dark sidebar, minimal cards, Inter font
- **Linear App** — dark sidebar with icon-only collapse, keyboard-first
- **Retool** — data-dense tables, consistent indigo primary
- **Shadcn/ui blocks** — card patterns, form layouts — https://ui.shadcn.com/blocks

## Component Library

All UI primitives live in `app/components/ui/`. See `CLAUDE.md` for usage rules.

## Animation Principles

- **Duration**: 150ms (micro), 250ms (normal), 350ms (page)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- **Scroll reveals**: `AnimateIn` component with `fadeUp` variant, staggered by 60-80ms per item
- **Sidebar**: 300ms width transition
- **Modals**: `fadeInScale` (250ms)
- **Dropdowns**: `fadeInScale` (150ms)
