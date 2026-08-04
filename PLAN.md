# VANGUARD Fleet Monitoring - UI/UX Overhaul Plan

## Context

VANGUARD is a TRAMOS-inspired fleet monitoring web application. The project has a solid foundation with realistic mock data, Leaflet maps, and a functional layout. However, the UI/UX needs a major overhaul to feel like a mature operational application rather than an AI-generated template.

**Key Issues Identified:**
1. Sidebar has dead link (Settings → href="#")
2. Color palette inconsistency: `history/` and `drivers/` use `navy-*` colors; all other pages use `steel-*`
3. Several pages are functional but lack interactive depth (Reports, Control, Snapshots, Dashcam, Geofences, Locate, Accidents)
4. No /settings page exists
5. Buttons lack feedback (no toast/notification system)
6. Task Monitor is well-built but map needs dark mode support
7. Drivers page uses card grid layout instead of table (harder to scan)
8. History page uses `navy-*` and has inconsistent styling
9. Dashboard is good but can be more compact

---

## Phase 1: Foundation Fixes

### 1.1 Create Settings Page
**File:** `frontend/src/app/(app)/settings/page.tsx`

Create a functional settings page with:
- Theme preference (light/dark/system)
- Map defaults (tile provider, zoom level)
- Table density (compact/comfortable)
- Notification preferences (mock toggles)
- Account preferences section
- Save button with toast feedback

### 1.2 Fix Sidebar Dead Link
**File:** `frontend/src/components/layout/Sidebar.tsx`

Change line 57:
```tsx
// Before
{ name: "Settings", href: "#", icon: Settings, badge: "Soon" }
// After
{ name: "Settings", href: "/settings", icon: Settings }
```

Remove the badge for Settings - it should be a live link.

### 1.3 Create Toast Notification System
**File:** `frontend/src/components/ui/Toast.tsx` (new)

Create a simple toast notification system:
- `success` variant (emerald)
- `error` variant (signal/red)
- `info` variant (steel/blue)
- Auto-dismiss after 3 seconds
- Stack multiple toasts
- Use React context for global access

Update `AppShell.tsx` to include Toast provider.

---

## Phase 2: Color Consistency Fixes

### 2.1 Fix History Page Color Palette
**File:** `frontend/src/app/(app)/history/page.tsx`

Replace all `navy-*` references with `steel-*` equivalents:
- `navy-100` → `steel-100`
- `navy-800` → `steel-800`
- `navy-900` → `steel-900`
- `navy-950` → `steel-950`
- `navy-400` → `steel-400`
- `navy-500` → `steel-500`
- `navy-700` → `steel-700`
- `navy-600` → `steel-600`
- `navy-300` → `steel-300`
- `navy-200` → `steel-200`

Update border classes to match steel palette.

### 2.2 Fix Drivers Page Color Palette
**File:** `frontend/src/app/(app)/drivers/page.tsx`

Replace all `navy-*` references with `steel-*` equivalents (same mapping as history).

### 2.3 Convert Drivers to Table Layout
**File:** `frontend/src/app/(app)/drivers/page.tsx`

Change from card grid to a dense table layout like vehicles page:
- Sortable columns: Name, Status, Vehicle, Safety Score, Phone, License
- Side detail panel for selected driver
- Filter pills for status
- Compact, scannable design

---

## Phase 3: Interactive Enhancements

### 3.1 Reports Page - Add Report Generator
**File:** `frontend/src/app/(app)/reports/page.tsx`

Add functionality:
- Click on report type → opens detail panel/preview
- Generate button → shows mock data preview table
- Export button → triggers toast feedback
- Filter by date range and unit
- Report queue table with actions (Review, Export)

### 3.2 Control Panel - Add Module Detail Panels
**File:** `frontend/src/app/(app)/control/page.tsx`

Make each module clickable:
- Click module → opens detail/config panel on the right
- Add mock forms for key settings (Users form, Telegram config, Webhook setup)
- Smart handling rules should be editable with save feedback

### 3.3 Snapshots Page - Add Filter and Review Modal
**File:** `frontend/src/app/(app)/snapshots/page.tsx`

Add functionality:
- Search input with filtering
- Event type filter dropdown
- Date range filter
- Review button → opens modal with larger image
- Download button → triggers toast feedback
- Empty state when no results

### 3.4 Dashcam Page - Add Channel Selection
**File:** `frontend/src/app/(app)/dashcam/page.tsx`

Add functionality:
- Click channel → changes main video area
- Live/Review/Offline status display
- Play/Pause controls
- Snapshot button → toast feedback
- Fullscreen button → toast (feature coming soon)
- Mute toggle

### 3.5 Geofences Page - Add Zone Detail Panel
**File:** `frontend/src/app/(app)/geofences/page.tsx`

Add functionality:
- Click zone → shows detail panel
- Add geofence → opens form panel
- Edit/Delete actions with confirmation
- Toggle visibility per zone
- Filter by type (warehouse/depot/customer/port)

### 3.6 Locate Page - Add Search and Actions
**File:** `frontend/src/app/(app)/locate/page.tsx`

Add functionality:
- Working search input with filtering
- Click unit → shows on map and in detail panel
- Action buttons: Open in Realtime Monitor, Open History, Copy coordinates
- Recent searches list
- Replace CSS placeholder with basic Leaflet map (reuse TrackingMap pattern)

### 3.7 Accidents Page - Add Review Actions
**File:** `frontend/src/app/(app)/accidents/page.tsx`

Add functionality:
- Click incident → opens detail side panel
- Review button → opens evidence modal
- Mark resolved button → updates status with toast
- Filter by severity/status/date
- Severity filter pills

---

## Phase 4: Global Improvements

### 4.1 Export CSV Feedback
Update all Export buttons across pages to show toast: "Exporting CSV... (simulated)"

### 4.2 Add Vehicle/Driver Modal
**File:** `frontend/src/app/(app)/vehicles/page.tsx` and `drivers/page.tsx`

Add "Add Vehicle" / "Add Driver" buttons that open a minimal form modal with toast feedback on submit.

### 4.3 Task Monitor - Add Speeding as Notification
**File:** `frontend/src/app/(app)/tasks/page.tsx`

The speeding notification already exists as an overlay. Ensure it's clearly separated from route data and shows as a live notification card that can be dismissed.

### 4.4 Dashboard - Make Quick Access Links Work
**File:** `frontend/src/app/(app)/dashboard/page.tsx`

The quick access module links already use `<a href="...">`. Ensure they all point to correct routes. Make the "Exception Monitor" section more compact.

---

## Phase 5: Component Extraction (Optional)

Extract reusable components if time permits:

### 5.1 StatusBadge Component
**File:** `frontend/src/components/ui/StatusBadge.tsx`

Extract status badge logic from tracking page into a reusable component.

### 5.2 PageHeader Component
**File:** `frontend/src/components/ui/PageHeader.tsx`

Extract the repeated pattern of metric-label + h1 + description into a reusable component.

---

## Implementation Order

1. **Sidebar fix** (5 min) - Quick win, unblocks settings
2. **Settings page** (30 min) - New page, straightforward
3. **Toast system** (45 min) - Foundation for all feedback
4. **History color fix** (15 min) - Consistency
5. **Drivers color fix + table conversion** (60 min) - Large change
6. **Reports enhancements** (45 min) - Interactive depth
7. **Control Panel enhancements** (45 min) - Interactive depth
8. **Snapshots enhancements** (30 min) - Search + modal
9. **Dashcam enhancements** (30 min) - Channel selection
10. **Geofences enhancements** (30 min) - Detail panel
11. **Locate enhancements** (30 min) - Search + map
12. **Accidents enhancements** (30 min) - Review actions
13. **Dashboard polish** (20 min) - Quick access verification
14. **Build + test** (30 min) - Verify all routes work

**Total estimated time:** ~6-7 hours

---

## Acceptance Criteria

- [ ] All sidebar links navigate correctly (no href="#")
- [ ] Settings page exists and saves preferences with toast feedback
- [ ] All pages use `steel-*` color palette consistently
- [ ] Drivers page uses table layout (not card grid)
- [ ] All Export/Add/Review buttons show toast feedback
- [ ] All filter/search inputs actually filter the data
- [ ] Map pages support dark mode
- [ ] Task Monitor speeding notification is separate from route
- [ ] Build succeeds without errors
- [ ] All 14 routes accessible and functional
