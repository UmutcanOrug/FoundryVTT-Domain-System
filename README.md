# DS: Domain System

DS is a Foundry VTT v13 build 351 module for Total War-inspired settlement, economy, construction, recruitment, and month management in Astargon campaigns. Open the panel with `K`.

## Core Loop

1. Operating buildings automatically reserve their full required POP. Halt buildings to release workers; halted or labor-starved buildings pay half upkeep and produce no effects.
2. Develop clickable Overview districts through five-tier Food, Materials, Commerce, Civic, Recruitment, Defense, and Siege trees.
3. Pay Crown and Materials when construction enters the queue. Free POP and building bonuses generate CP each month, so projects have no fixed month duration.
4. Balance monthly Food production against population and army consumption. Food is a flow, not stored currency.
5. Recruit any unit unlocked by completed military ancestry from one shared monthly Recruitment Capacity pool.
6. Track regiment Current / Maximum strength. Replenishment uses Crown and manpower, requires no building, consumes no Recruitment Capacity, and resolves at month end.
7. Process one settlement or close the global month, then let the GM approve, narrate, reroll, or ignore the d100 result.

## Key Systems

- Hamlet, Village, Town, City, and Metropolis progression with editable population, costs, CP, open slots, and maximum slots.
- Default district limits of `2/3`, `3/4`, `4/6`, `6/8`, and `8/10` from Hamlet through Metropolis.
- Tier-based Free POP Crown income of `10/20/30/40/50`.
- Pure Grain and Stone branches, hybrid Pastoral and Foundry branches, dedicated Commerce income, and Civic Order/Growth development.
- Terrain and Biome gates are removed; settlement identity is carried by its region, description, background, buildings, and landmarks.
- Inland Commerce lowers settlement building upkeep; maritime Commerce favors higher Crown and event rolls.
- Exact Food Security bands from `-3%` Growth below 50% coverage to `+1.5%` Growth at 200% coverage.
- Exact Public Order income modifiers of `-50/-25/0/+10/+20%`, plus Growth and event-roll effects.
- Population pressure on both Growth and Public Order, configurable by the GM.
- One manpower cap based on Total POP, a recovering manpower reserve, and a separate pooled monthly Recruitment Capacity.
- One unit upkeep value, defaulting to 20% of recruit price per month.
- Defense buildings with explicit free auto-garrisons, Public Order, and Siege Defense percentages.
- Current / Maximum regiment strength, per-regiment images and Actor UUID links, and building-free replenishment.
- A paged 4x2 Overview district board, compact branch selector, aligned lineage trees, branch colors, and hidden locked player units.
- A scroll-safe Overview branch workspace that keeps Tier IV-V reachable at wide and narrow Foundry window sizes.
- Tierless landmarks that consume no district, plus immediate or queued GM landmark placement.
- Building-granted slots are generic district slots; Laurent Manor grants two and World Market grants one.
- Content Library unit trees for Infantry, Ranged, Cavalry, and Siege, plus a separate Unique Units roster with direct recruitment-building assignment.
- Controlled player Treasury deposits and withdrawals with Chronicle audit entries.
- GM-editable building, unit, event, permission, economy, military, Growth, Order, and settlement-tier rules.
- Blank Hamlet, Starter Hamlet, Starter Village, and Starter Town templates.
- Individual settlement processing, pending-only global month close, duplicate-process protection, and pre-turn snapshots.
- De Laurent remains a player settlement and never becomes a reusable template.
- Schema v9 migration preserves custom settlements, ownership, catalog entries, images, regiments, logs, customized Laurent Manor values, and custom tier rules while removing Terrain/Biome data and merging old Economic/Military bonus slots.

## Balance Reference

The automated v0.1.13 City scenario uses `5,000 POP`, one Food district, seven other City districts, and Laurent Manor. It produces `249,150` gross Crown, pays `15,066` building upkeep, sustains approximately `1,957 Men-at-Arms`, and retains `142%` Food coverage. Separate upper-bound tests confirm that one suitable Food district sustains an army-free settlement through its tier; armies create the intended additional pressure.

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
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/DS-v0.1.13.zip
```
