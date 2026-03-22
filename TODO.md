# AccountaBuddy Implementation TODO

Based on the [product vision](README.md#product-vision) and implementation plan.

## Phase 1: Goal model + onboarding

- [x] Add Goal data model (name, description, timescale, reminder policy)
- [x] First-launch flow: route to Create Goal if none exist
- [x] Refactor habits → goals in storage, screens, and services
- [x] Make goals editable from detail screen or settings
- [x] Wire NotificationService to work with goals model

## Phase 2: Auth + cloud persistence

- [ ] Add auth (email/password + Google) via Firebase or Supabase
- [ ] Add backend/BaaS for goals and responses
- [ ] Implement sync logic with offline cache for signed-in users
- [ ] Migrate from AsyncStorage to cloud-backed storage

## Phase 3: AI persona + full context

- [ ] Define AI system prompt with buddy persona (encourage, nudge, guilt)
- [ ] Pass goal text, timescale, and recent check-ins to AI on each call
- [ ] Wire main check-in flow to use full AI context

## Phase 4: Smart notifications

- [ ] Add user profile (wake/sleep, timezone) for notification scheduling
- [ ] Build notification scheduling engine from behavioral principles

## Phase 5: Platforms

- [ ] Polish mobile web layout and notification strategy
- [ ] Test and refine iOS build
