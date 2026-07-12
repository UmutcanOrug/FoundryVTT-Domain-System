# DS: Domain System

DS is a Foundry VTT v13 build 351 module for Total War-inspired settlement, economy, construction, army, and month management in Astargon campaigns. The panel opens with `K`.

## Core Loop

1. Assign civilian POP to completed buildings. Unassigned Free POP produces tier-based Crown, subsistence Food, and construction CP; Total POP determines manpower cap.
2. Build from clickable Overview districts or the detailed Construction board. Every building belongs to a five-tier family aligned with Hamlet through Metropolis.
3. Pay Crown, Materials, and any Food cost when construction is queued. Progress is driven by CP, not a fixed month duration.
4. Choose a branch inside each district and invest toward City and Metropolis nodes. Built-in economic families can be developed in up to two districts, while military families remain unique.
5. Recruit only the units unlocked by a staffed military building. Track casualties as Current / Maximum Strength and replenish losses from a monthly recovering manpower reserve.
6. Process one settlement or close the global month. Manpower recovery, Crown, Food, Materials, recruitment, growth, construction, and a pending d100 event are resolved in order.
7. Review the d100 result as GM, then apply a timed percentage modifier, keep it narrative-only, reroll it, or ignore it.

## Features

- Hamlet, Village, Town, City, and Metropolis progression with editable POP, Crown, Materials, Food, CP, and slot rules.
- Crown, Food, Materials, Public Order, construction CP, manpower, defense, and abstract army power.
- Four color-coded five-tier economic families: Food, Materials, Commerce, and Civic development.
- Three five-tier military families: Recruitment, Defense, and Siege, plus tierless GM landmarks that do not consume a district.
- Explicit branch choices such as Infantry Yard into Drill Hall or Stable Compound.
- Real multi-slot buildings, building-granted bonus slots, purchasable districts, category restrictions, and GM locks.
- Staffing ratios that scale output, recruitment, capacity, defense, public order, and building bonuses.
- Building-specific unit rosters, strategic resource tags, one military capacity pool, a monthly recovering manpower reserve, and per-unit limits.
- One readable Power value per unit, Current / Maximum regiment strength, troop Food use, and month-end replenishment that spends manpower without consuming recruitment-building capacity.
- One active settlement policy with tier-gated tradeoffs for growth, taxation, army upkeep, Food, manpower, Public Order, and d100 events.
- Tier-based Free POP Crown income of 10/20/30/40/50 from Hamlet through Metropolis, with specialist economic districts that deliberately trade direct Crown for Food, Materials, Growth, Order, or military support.
- Pure Grain and Stone production paths, hybrid Pastoral and Iron paths, dedicated Commerce income, and non-income Civic development with visible strategic tradeoffs.
- Ratio-based Food Security, capped reserve bonuses, and logarithmic Population Pressure that makes large settlements require continued Food and Growth investment.
- A paged 4x2 Overview district board, opaque Total War-style branch overlays, fixed lineage columns, a readable building-detail panel, branch colors, and player rosters that hide locked units.
- GM-editable building, unit, and d100 event libraries with timed income, upkeep, output, construction, recruitment, growth, and Public Order modifiers.
- GM Direct building placement, recruitment records, regiment creation, queue repair, resource correction, and manual tier controls.
- Blank Hamlet, Starter Hamlet, Starter Village, and Starter Town templates plus custom template creation.
- Individual settlement processing, pending-only global month close, duplicate-process protection, and restorable pre-turn snapshots.
- De Laurent remains an ordinary player settlement; Laurent Manor is a single tierless, 5-POP landmark and is never used as a reusable template.
- Schema v7 migration preserves settlement identity, ownership, custom images, custom catalog entries, regiments, notes, rules, and logs while refreshing built-in economic balance.

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
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/DS-v0.1.11.zip
```
