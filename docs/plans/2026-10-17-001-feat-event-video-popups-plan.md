---
title: Event-Triggered Video Popups - Plan
type: feat
date: 2026-10-17
topic: event-video-popups
execution: code
---

# Event-Triggered Video Popups - Plan

## Goal

When a configured Home Assistant entity changes state (e.g. a doorbell is
pressed, a gate opens, motion is detected), the dashboard page that is open
shows a popup with a live camera stream. At the same moment it plays a sound
(e.g. a doorbell chime). Below the stream the popup can show a few related
entities (e.g. the front door lock or a gate switch) so the user can act
without leaving the popup.

- Rules are set **per page** and stored with the page.
- The camera and the trigger entities are picked from the connected HA
  instance with the existing `EntityField` / `EntityAutocomplete` pickers.
- Nothing new on the HA side is needed: it runs on the existing WebSocket
  connection in `@casaboard/ha`.

## Current state (what we build on)

| Need | Existing piece |
| --- | --- |
| Live entity states | `HAProvider` (`packages/ha/provider/HAProvider.tsx`) keeps an `entities` map up to date via `subscribeEntities`. |
| Camera streaming (WebRTC → HLS → MJPEG fallback) | `useCameraStream` + `CameraPlayer` (`packages/ui/components/Camera/`). `forceVisible` already exists for modal use. |
| Entity pickers | `EntityField` (domain-filtered) and `EntityAutocomplete` (`packages/ui/components/EntityAutocomplete/`). |
| Rendering any entity as a control | `EntityTile` with `tileLayout="row"` (`packages/ui/components/EntityTile/EntityTile.tsx`). |
| Per-page config that is saved with the page | Puck `root` props in `PuckConfig.root` (`packages/ui/components/puck/puck.config.tsx`), stored in `page.puck_data.root.props`. |
| Viewer-only mount point | `PuckRenderer` (`packages/ui/components/puck/PuckRenderer.tsx`). It renders dashboards only; the editor uses `<Puck>`. |
| Pure-logic unit tests | `tsx --test` in `packages/ha` (see `camera/stream.test.ts`, `alarm/alarm.test.ts`). |

## Key decisions

1. **Store the config in Puck root props, not as a new `Page` field.**
   Add an `eventPopups` array field to `PuckConfig.root.fields`. It shows up
   in the editor's "Page layout" panel when nothing is selected, saves with
   `puck_data`, and comes along in settings backup/import
   (`SettingsBundle.pages`) without schema, store or API changes. The
   alternative, a top-level `Page.event_popups` edited in the Page Settings
   modal, would mean touching `packages/types/page.ts`,
   `packages/lib/store/pages.ts`, `pageActions.ts`, the API route and
   `PuckEditorClient`, and the modal has no array-field UI to reuse.

2. **Mount the popup host in `PuckRenderer`, not in `root.render`.**
   `root.render` also runs inside the editor canvas, and popups must not fire
   while someone is editing. `PuckRenderer` reads
   `pageData.puck_data.root.props.eventPopups` and renders an
   `<EventPopupHost rules={…} />` next to `<Render>`.

3. **Detect triggers by diffing the `HAProvider` entity map.** Do not add one
   `subscribeEvents("state_changed")` per rule (the pattern `useEntity` uses).
   Keep a ref of the previous state for each watched entity and compare on
   every update. The first snapshot after connecting or reconnecting is only
   recorded, never fired, so loading a page never sets off a popup.

4. **Ship sounds without audio files in v1.** Built-in chimes ("Doorbell
   ding-dong", "Chime", "Alert beep") are synthesised with the Web Audio API
   (oscillator + gain envelope). There are no asset licensing questions and
   nothing to bundle. A "Custom URL" option plays any `http(s)` audio URL
   through `HTMLAudioElement`, including files in HA's `/local/`.

5. **Reuse the camera stream stack as-is.** The popup renders `CameraPlayer`
   fed by `useCameraStream({ forceVisible: true, enabled: open })`. Extract
   nothing from `Camera/index.tsx` unless it turns out to be needed.

## Data model

New file `packages/types/eventPopup.ts`, re-exported from
`packages/types/index.ts`:

```ts
export type EventPopupTriggerMode =
  | "to_state"     // new state equals `toState` (optionally from `fromState`)
  | "any_change";  // any state change (fits `event.*` doorbell entities, whose state is a timestamp)

export type EventPopupSound =
  | "none"
  | "doorbell"
  | "chime"
  | "alert"
  | "custom";

export interface EventPopupRule {
  name?: string;                    // popup title; falls back to the camera's friendly name
  enabled: boolean;

  // Trigger
  triggerEntityId: string;          // e.g. binary_sensor.doorbell, event.front_door_ding
  triggerMode: EventPopupTriggerMode;
  toState?: string;                 // e.g. "on"; required for to_state
  fromState?: string;               // optional guard, e.g. "off"
  cooldownSeconds: number;          // ignore re-triggers inside this window (default 30)

  // Stream
  cameraEntityId: string;           // camera.*
  allowAudio: boolean;              // same meaning as Camera.audioEnabled (starts muted)

  // Sound
  sound: EventPopupSound;
  soundUrl?: string;                // when sound === "custom"
  soundVolume: number;              // 0–1, default 0.8
  soundRepeat: number;              // times to play, default 1

  // Popup behaviour
  autoCloseSeconds: number;         // 0 = stay open until dismissed (default 30)
  closeWhenTriggerClears: boolean;  // close when the trigger entity leaves `toState`

  // Extras below the stream
  entities: { id: string }[];       // rendered with EntityTile tileLayout="row"
}
```

Rules have no `id`: Puck's `defaultItemProps` is a static object, so every new
item would get the same id. The hook tracks cooldowns by array index instead.
Phase 1 ships only the trigger, stream and auto-close fields; the sound and
`entities` fields are added in later phases.

Root props gain `eventPopups: EventPopupRule[]`. The default is `[]`, so
existing pages are unaffected.

## Components and files

### `packages/ha` (pure logic, unit-tested)

- `events/popupTrigger.ts`
  - `matchesTrigger(rule, prevState, nextState): boolean`: handles
    `to_state`, `any_change`, `fromState`, and ignores
    `unavailable`/`unknown` transitions (both to and from them, so a
    reconnect never fires).
  - `shouldFire(rule, now, lastFiredAt): boolean`: applies the cooldown.
- `events/popupTrigger.test.ts`: added to the `test` script in
  `packages/ha/package.json`.
- Export both from `packages/ha/index.ts`.

### `packages/ui/components/EventPopup/`

| File | Purpose |
| --- | --- |
| `EventPopup.fields.tsx` | The Puck `array` field definition for `eventPopups`: `EntityField` for the trigger (any domain) and camera (`domain="camera"`), selects/radios for mode, sound, auto-close, plus a nested `entities` array that uses `EntityAutocomplete` (same pattern as `EntitiesCard.config.tsx`). `getItemSummary` shows `name` or the trigger entity id. `defaultItemProps` fills in sensible defaults and a fresh `id`. |
| `useEventPopupTriggers.ts` | Takes `rules`, reads `entities` from `useHA()`, keeps `prevStatesRef` and `lastFiredRef`, and returns `{ active, dismiss }`. Applies the "first snapshot is a baseline" rule from decision 3. Handles `closeWhenTriggerClears`. |
| `EventPopupHost.tsx` | Calls the hook, holds the queue (see Behaviour), renders `EventPopupModal` for the active rule, and starts the sound when a popup opens. |
| `EventPopupModal.tsx` | HeroUI `Modal` (`size="5xl"`, `backdrop="blur"`, dark styling matching the Camera expand modal). It has a header with the title and a close button, `CameraPlayer` via `useCameraStream`, an optional row/grid of `EntityTile`s below the stream, and an auto-close countdown bar. |
| `notificationSound.ts` | `playPreset(preset, { volume, repeat })` using a shared lazily created `AudioContext`, `playUrl(url, opts)` using `HTMLAudioElement`, and `stopAll()` (called when the popup closes). |
| `useAudioUnlock.ts` | Browsers block audio until the user has interacted with the page. On the first `pointerdown`/`keydown` anywhere on the dashboard, resume the `AudioContext` and play a silent buffer. Expose `isUnlocked`. |
| `index.ts` | Barrel export. |

### Wiring

- `packages/ui/components/puck/puck.config.tsx`: add `eventPopups` to
  `root.fields` (from `EventPopup.fields.tsx`) and `eventPopups: []` to
  `root.defaultProps`. `RootCanvas` ignores the prop.
- `packages/ui/components/puck/PuckRenderer.tsx`: render
  `<EventPopupHost rules={pageData.puck_data.root?.props?.eventPopups ?? []} />`
  inside the `ThemeScope`, so the popup picks up page theme tokens.

## Behaviour

- **Firing:** when a rule matches and is outside its cooldown, the popup opens
  and the sound plays at the same time. The video shows the camera poster
  straight away, then the live stream once WebRTC/HLS negotiates.
- **Re-trigger while open:** if the same rule fires again (e.g. the doorbell
  is pressed twice), restart the auto-close timer and replay the sound. The
  cooldown still applies.
- **Several rules at once:** one popup at a time. A different rule firing
  while one is open goes into a FIFO queue and shows when the current one
  closes. Duplicate entries for the same rule are dropped.
- **Closing:** closes on the close button, backdrop/Escape, auto-close timeout,
  or (optionally) when the trigger clears. Closing stops the sound and tears
  down the stream; `useCameraStream` already does this when `enabled` goes
  false.
- **Audio blocked:** if sound is configured but audio is still locked, the
  popup still opens and shows a small "Tap to enable sound" hint. Tapping
  unlocks audio and replays the sound.
- **Editor:** no popups fire in the editor (decision 2). Phase 3 adds a "Test"
  button so the popup can be previewed there.
- **Disconnected HA:** no triggers fire. On reconnect, the first snapshot is
  only recorded as a baseline (decision 3), so stale events don't replay.

## Implementation phases

### Phase 1: Trigger + popup + stream (MVP) — done (2026-10-17)

Notes: `shouldFire` shipped as `isOutsideCooldown`. When more than one rule
fires in the same update, the last one wins until the Phase 3 queue lands. When
live streaming fails, the popup shows the camera snapshot and refreshes it
every 5 s (open question 3).

1. `packages/types/eventPopup.ts` types.
2. `packages/ha/events/popupTrigger.ts` with tests: `to_state`, `fromState`
   guard, `any_change`, unavailable/unknown handling, cooldown.
3. `useEventPopupTriggers` with the baseline snapshot, cooldown and
   dismiss.
4. `EventPopupModal` with `CameraPlayer` + `useCameraStream`, a close
   button and auto-close.
5. `EventPopupHost` mounted in `PuckRenderer`.
6. Root `eventPopups` field: trigger entity, mode, to/from state, camera,
   auto-close, cooldown, enabled.

### Phase 2: Audio notifications

1. `notificationSound.ts` with the three synthesised presets and the custom
   URL option.
2. `useAudioUnlock` and the "Tap to enable sound" hint.
3. Sound, volume and repeat fields on the rule.
4. Stop the sound on close and replay it on re-trigger.

### Phase 3: Entities below the stream + polish

1. Nested `entities` array field and an `EntityTile` row list in the modal
   (up to 2 columns on wide screens, 1 on phones).
2. `closeWhenTriggerClears`.
3. Multi-rule FIFO queue.
4. Editor "Test popup" button. It is a custom field render inside each rule
   item that opens `EventPopupModal` for that rule right away.
5. README section under the dashboard builder docs, with a doorbell example
   (`event.front_door_ding` → `camera.front_door`, doorbell sound, lock below).

## Testing

- **Unit (`packages/ha`, `tsx --test`):** trigger matching and cooldown, as
  listed above.
- **Type check / lint:** `npm run check-types` and `npm run lint` at the root.
- **Manual against a real HA:**
  - Use an `input_boolean` as the trigger and toggle it from HA. The popup
    opens with the stream, and the sound plays after the first tap on the
    page.
  - An `event.*` entity with `any_change` fires on every press.
  - Reloading the page while the trigger is already `on` does **not** open
    the popup.
  - Cooldown, auto-close, close-on-clear, and the queue of two rules behave
    as described.
  - Entities below the stream can be controlled (toggle a switch, unlock a
    lock).
  - Old pages without `eventPopups` render unchanged, and backup/import
    keeps the rules.

## Out of scope for v1 (possible follow-ups)

- **Global (all-pages) rules:** same field on the Sidebar's Puck root, so a
  rule fires on any page that uses that sidebar.
- **Triggers from custom HA events:** e.g. an automation fires
  `casaboard_popup` with `{ camera, title }`. This needs a
  `connection.subscribeEvents` path alongside the entity diff.
- **Attribute-based triggers** (e.g. `attributes.event_type == "ring"`).
- **Playing the sound on an HA `media_player`** through `media_player.play_media`,
  or picking sounds from the HA media browser (`media_source/resolve_media`).
- **Screen handling:** waking the screen or using the Wake Lock API for kiosks
  with the display off. Fully Kiosk-style browsers handle this today.
- **Two-way audio / talk-back.**

## Open questions

1. ~~Is per-page enough for v1?~~ Yes, per-page is enough for now.
2. Are synthesised chimes plus a custom URL enough, or should we bundle
   recorded (CC0) sound files?
3. ~~When the camera stream fails, should the popup still show a snapshot?~~
   Yes: it shows the refreshing snapshot, and will also show the entities
   once Phase 3 adds them.
