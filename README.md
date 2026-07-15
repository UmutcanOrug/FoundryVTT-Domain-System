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
- Default Crown promotion costs of `20,000/80,000/300,000/1,000,000` from Village through Metropolis.
- Tier-based Free POP Crown income of `10/20/30/40/50`.
- Pure Grain and Stone branches, hybrid Pastoral and Foundry branches, dedicated Commerce income, and Civic Order/Growth development.
- Terrain and Biome gates are removed; settlement identity is carried by its region, description, background, buildings, and landmarks.
- Grand Bazaar and World Market reduce both building and army upkeep; maritime Commerce favors Crown and event rolls while adding modest Food and Materials support.
- Stone development progressively reduces construction Crown and Materials costs while boosting CP; Iron development progressively reduces army upkeep.
- Cultural Capital combines Public Order with a settlement-wide Crown bonus, while Sacred University trades Order for Growth and building-upkeep reduction.
- Exact Food Security bands from `-3%` Growth below 50% coverage to `+1.5%` Growth at 200% coverage.
- Exact Public Order income modifiers of `-50/-25/0/+10/+20%`, plus Growth and event-roll effects.
- Population pressure on both Growth and Public Order, configurable by the GM.
- A visible Public Order equation showing Base, Buildings, Policy, Events, Population Pressure, and the resulting Effective Order.
- Heroic Land Grants for early development: `+20 POP` each month with major Crown, Food, upkeep, and Order penalties that remain flat as the settlement grows.
- One manpower cap based on Total POP, a recovering manpower reserve, and a separate pooled monthly Recruitment Capacity.
- One unit upkeep value, defaulting to 20% of recruit price per month.
- Defense buildings with real free settlement-garrison regiments, Public Order, and Siege Event Mitigation percentages. Garrison casualties persist and can be replenished without consuming Recruitment Capacity.
- Current / Maximum regiment strength, per-regiment images and Actor UUID links, and building-free replenishment.
- A paged 4x2 Overview district board, compact branch selector, fixed-row lineage trees, branch colors, and hidden locked player units.
- A scroll-safe Overview branch workspace that keeps Tier IV-V reachable at wide and narrow Foundry window sizes.
- Tierless landmarks that consume no district, plus immediate or queued GM landmark placement.
- Building-granted slots are generic district slots; Laurent Manor and Grand Fortress grant two, while Stone Walls grants one.
- Content Library unit trees for normal Infantry, Ranged, Cavalry, and Siege development, plus a landmark-only Unique roster with Gladiators and Elven Guard.
- Guided Building Chain, Unit Tree, and Add Regiment workshops with linked-node previews, complete stat editing, Actor drag/drop, and raised/garrison placement.
- GM-editable content categories and policies, including custom colors, icons, ordering, effects, and settlement-rank availability.
- Settlement-specific timed or permanent GM buffs and debuffs with public or GM-only visibility.
- Full-world backup/restore and reusable-content export/import for moving catalogs, categories, policies, and events between worlds without overwriting settlements during content merges.
- Controlled player Treasury deposits and withdrawals with Chronicle audit entries.
- GM-editable building, unit, event, permission, economy, military, Growth, Order, and settlement-tier rules.
- Blank Hamlet, Starter Hamlet, Starter Village, and Starter Town templates.
- Individual settlement processing, pending-only global month close, duplicate-process protection, and pre-turn snapshots.
- De Laurent remains a player settlement and never becomes a reusable template.
- Schema v12 migration preserves custom settlements, ownership, catalog entries, images, Actors, regiments, logs, customized Laurent Manor values, custom rank prices, and custom slot rules while adding real garrison records and editable content definitions.

## Balance Reference

The automated v0.1.17 City scenario uses `5,000 POP`, one Food district, seven other City districts, and Laurent Manor. It produces `249,150` gross Crown, pays `15,390` building upkeep, can sustain approximately `2,365 Men-at-Arms`, and reaches about `143%` Food coverage. A representative six-district T3 Town has `285,000` Crown in final-node prices.

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
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/DS-v0.1.17.zip
```
