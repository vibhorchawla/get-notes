# GetNotes v2.0 — Premium Dark UI Polish Report

**Date:** July 25, 2026  
**Status:** Complete — TypeScript passes with zero errors  
**Design Language:** Premium Modern Dark UI

---

## Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#00C2A8` | Teal accent — buttons, icons, highlights |
| Secondary | `#4FD1C5` | Softer teal — secondary actions |
| Background Top | `#081018` | Gradient start |
| Background Mid | `#0D1A22` | Gradient middle |
| Background Bottom | `#101419` | Gradient end |
| Card Surface | `rgba(18,24,32,0.88)` | All card backgrounds |
| Border | `rgba(255,255,255,0.08)` | Card/container borders |
| Text Primary | `#FFFFFF` | Headings, titles |
| Text Secondary | `#94A3B8` | Descriptions, metadata |
| Text Light | `#64748B` | Hints, placeholders |

### Typography

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| XXXL | 38px | Bold | Large hero headings |
| XXL | 30px | Bold | Screen titles |
| XL | 24px | Bold | Section titles |
| LG | 18px | Semibold | Card titles |
| MD | 16px | Medium | Body text |
| SM | 14px | Regular | Metadata |
| XS | 12px | Regular | Badges, small labels |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| Card Padding | 20px | Inside all cards |
| Screen Padding | 20px | Horizontal screen margins |
| Section Gap | 28px | Between major sections |
| Item Gap | 12px | Between list items |

---

## Files Modified

### Design Tokens (3 files)
- `constants/colors.ts` — Complete palette rewrite + dark theme object for upload wizard
- `constants/typography.ts` — Refined font sizes (XXXL bumped to 38px)
- `constants/spacing.ts` — Card padding 16→20, section gap 24→28

### Core Components (16 files)
| Component | Key Changes |
|-----------|-------------|
| `GradientBackground.tsx` | 3-stop gradient #081018→#0D1A22→#101419, accepts `dark` prop |
| `Header.tsx` | Teal glow logo badge, updated tagline pill color |
| `Button.tsx` | Filled = #00C2A8, Outlined = white 15%, removed shadows for cleaner look |
| `SearchBar.tsx` | 48px height, 16px radius, removed shadow |
| `CategoryPill.tsx` | 24px radius, teal active state |
| `BottomBar.tsx` | Floating pill with teal accent add button, stronger shadow |
| `TopHeader.tsx` | 42px menu button, consistent card background |
| `SearchNoteCard.tsx` | 20px radius, teal icon backgrounds, premium badge updated |
| `NoteItem.tsx` | 20px radius, teal icon container |
| `EmptyState.tsx` | 88px icon container, teal background |
| `ErrorState.tsx` | 88px icon container, updated retry button |
| `LoadingSkeleton.tsx` | Dark shimmer color `rgba(255,255,255,0.05)`, 20px radius |
| `MarketplaceCard.tsx` | 20px radius, dark badge background |
| `SettingsRow.tsx` | Teal icon backgrounds, 16px chevron |
| `FloatingActionButton.tsx` | Teal shadow glow |
| `CustomDrawerContent.tsx` | Teal profile section, dark logout button |
| `OfflineBanner.tsx` | Semi-transparent red |
| `PersonalNoteCard.tsx` | 20px radius, teal tags |
| `PricingCard.tsx` | Card background = cardBackground, teal accent |

### Screens (12 files)
| Screen | Key Changes |
|--------|-------------|
| `home.tsx` | Glow dots on section headers, 20px card radius, 28px section gap |
| `community/index.tsx` | Teal active tabs, 999-radius pills |
| `profile.tsx` | Teal badge/pill colors, card backgrounds |
| `downloads.tsx` | Consistent with new card styles |
| `saved.tsx` | Consistent with new card styles |
| `settings.tsx` | 20px radius settings cards |
| `notes.tsx` | Teal sort button background |
| `subscription.tsx` | #081018 background, teal accent |
| `note/[id].tsx` | Teal contributor avatar, 20px cards, teal PDF card |
| `course/[id].tsx` | Teal semester icons, 20px cards |
| `semester/[id].tsx` | Teal subject icons, 20px cards |
| `subject/[id].tsx` | Teal sort chips |

### Auth & Misc (5 files)
| File | Changes |
|------|---------|
| `login.tsx` | #7C3AED → #00C2A8, #1A1A2E → #081018 |
| `signup.tsx` | #7C3AED → #00C2A8, #1A1A2E → #081018 |
| `onboarding.tsx` | #7C3AED → #00C2A8, #1A1A2E → #081018 |
| `coming-soon.tsx` | Teal icon container |
| `app.json` | Splash bg #081018 |

### Upload Wizard (10 files)
- All `rgba(79,70,229,...)` → `rgba(0,194,168,...)` across ProgressIndicator, ReviewSummary, StepHeader, SelectionCard, FormField, GlassCard, GradientButton, AnimatedStepper
- DriveFilePickerModal updated with new colors

---

## Design Principles Applied

1. **Consistent 20px card radius** across all cards and modals
2. **Thin white border at 8% opacity** on all card surfaces
3. **Subtle glow dots** (8px circles with shadow) before every section title on Home
4. **Teal primary accent** (#00C2A8) as the single cohesive accent color
5. **Large bold headers** with -0.3 to -0.6 letter-spacing for premium feel
6. **Comfortable vertical spacing** — 28px between sections, 20px screen padding
7. **Reading-focused** — no visual clutter, clean card layouts, muted metadata
8. **Floating bottom bar** with teal add button as focal point
9. **Card surface** uses rgba for depth perception against gradient background
10. **No functionality changes** — pure visual polish

---

## Verification

- **TypeScript:** `npx tsc --noEmit` passes with 0 errors
- **Old color references:** All `#5B7FFF`, `#818CF8`, `#7C3AED`, `#1A1A2E`, `rgba(79,70,229,...)` replaced
- **All 32 screen files** and **33 component files** touched or verified
- **Upload wizard** backward-compatible via `colors.dark` palette
