# DS: Domain System

DS is a Foundry VTT v13 build 351 module for Total War-inspired settlement, economy, construction, army, and month management in Astargon campaigns. The panel opens with `K`.

## Core Loop

1. Assign civilian POP to completed buildings. Unassigned Free POP produces taxes, subsistence Food, construction CP, and manpower.
2. Build from clickable Overview districts or the detailed Construction board. Every building belongs to a five-tier family aligned with Hamlet through Metropolis.
3. Pay Crown, Materials, and any Food cost when construction is queued. Progress is driven by CP, not a fixed month duration.
4. Choose exclusive economic or military branches inside a district and invest toward City and Metropolis nodes.
5. Recruit only the units unlocked by a staffed military building. GM Direct recruitment remains available as an explicit override.
6. Process one settlement or close the global month. Crown, Food, Materials, recruitment, growth, construction, and a pending d100 event are resolved in order.
7. Review the d100 result as GM, edit its suggested effects, then Apply, Reroll, or Ignore it.

## Features

- Hamlet, Village, Town, City, and Metropolis progression with editable POP, Crown, Materials, Food, CP, and slot rules.
- Crown, Food, Materials, Public Order, construction CP, manpower, defense, and abstract army power.
- Four five-tier economic families: Land, Resources, Commerce, and Civic development.
- Four five-tier military families: Recruitment, Defense, Siege, and the GM-only Laurent Estate chain.
- Explicit branch choices such as Infantry Yard into Drill Hall or Stable Compound.
- Real multi-slot buildings, building-granted bonus slots, purchasable districts, category restrictions, and GM locks.
- Staffing ratios that scale output, recruitment, capacity, defense, public order, and building bonuses.
- Building-specific unit rosters, strategic resource tags, professional or militia capacity, manpower reservation, and per-unit limits.
- Abstract 0-10 combat attributes, calculated regiment power, regiment-specific images, and optional Foundry Actor UUID links.
- GM-editable building, unit, and d100 event libraries with Apply Existing actions for template changes.
- GM Direct building placement, recruitment records, regiment creation, queue repair, resource correction, and manual tier controls.
- Blank Hamlet, Starter Hamlet, Starter Village, and Starter Town templates plus custom template creation.
- Individual settlement processing, pending-only global month close, duplicate-process protection, and restorable pre-turn snapshots.
- De Laurent remains an ordinary player settlement and is never used as a reusable template.
- Schema v3 migration preserves existing settlements, troops, queues, ownership, notes, and logs while replacing legacy built-in balance data.

See `KULLANIM-KILAVUZU.md` for the complete Turkish workflow and rule reference.

## Release

Repository:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System
```

Latest manifest:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/module.json
```

Latest package:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/DS-v0.1.7.zip
```
