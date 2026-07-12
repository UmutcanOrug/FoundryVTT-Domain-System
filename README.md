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
- Inland Commerce lowers settlement building upkeep; maritime Commerce favors higher Crown and event rolls.
- Exact Food Security bands from `-3%` Growth below 50% coverage to `+1.5%` Growth at 200% coverage.
- Exact Public Order income modifiers of `-50/-25/0/+10/+20%`, plus Growth and event-roll effects.
- Population pressure on both Growth and Public Order, configurable by the GM.
- One manpower cap based on Total POP, a recovering manpower reserve, and a separate pooled monthly Recruitment Capacity.
- One unit upkeep value, defaulting to 20% of recruit price per month.
- Defense buildings with explicit free auto-garrisons, Public Order, and Siege Defense percentages.
- Current / Maximum regiment strength, per-regiment images and Actor UUID links, and building-free replenishment.
- A paged 4x2 Overview district board, compact branch selector, aligned lineage trees, branch colors, and hidden locked player units.
- Tierless landmarks that consume no district, plus immediate or queued GM landmark placement.
- Controlled player Treasury deposits and withdrawals with Chronicle audit entries.
- GM-editable building, unit, event, permission, economy, military, Growth, Order, and settlement-tier rules.
- Blank Hamlet, Starter Hamlet, Starter Village, and Starter Town templates.
- Individual settlement processing, pending-only global month close, duplicate-process protection, and pre-turn snapshots.
- De Laurent remains a player settlement and never becomes a reusable template.
- Schema v8 migration preserves custom settlements, ownership, catalog entries, images, regiments, logs, and customized Laurent Manor values while removing obsolete Biome and strategic-resource data.

## Balance Reference

The automated v0.1.12 City scenario uses eight City districts plus Laurent Manor. It produces `141,488` gross Crown, pays `14,973` building upkeep, sustains approximately `1,013 Men-at-Arms`, and retains `192%` Food coverage. This is a regression target, not a mandatory campaign build.

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
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/DS-v0.1.12.zip
```
