# DS: Domain System

DS is a Foundry VTT v13 build 351 module for Total War-inspired settlement, economy, construction, progression, and recruitment management in Astargon campaigns.

## Core Loop

1. Players assign POP to completed buildings and keep Free POP for taxes and construction CP.
2. Construction begins from a settlement district slot and follows explicit building branches.
3. Crown is paid when a project is queued; the project completes only after its CP requirement is filled.
4. Settlement progression unlocks through POP, Crown, CP, and the settlement hierarchy.
5. Completed recruitment buildings unlock only their configured units and monthly training capacity.
6. Every recruitment order creates a separate regiment with its own name, image, notes, and deployment mode.
7. A GM may process one settlement for the current month or close the global month and process only pending settlements.

## Features

- Opens with the `K` key.
- Supports Hamlet, Village, Town, City, and Metropolis progression.
- Uses real district slots with tier unlocks, Crown purchases, GM locks, and category restrictions.
- Uses explicit building nodes and exclusive branch choices instead of generic level multiplication.
- Includes rebuilt agriculture, timber, leather, stone, iron, livestock, harbor, orchard, medicine, trade, logistics, barracks, watch, defense, and siege chains.
- Keeps buildings in Economic or Military categories; Special is an optional marker on either category.
- Uses Free POP as the base construction CP source and shows a dynamic ETA rather than a fixed duration.
- Supports multiple active projects by settlement tier, weighted CP sharing, overflow, and one-use hired CP.
- Uses building-specific recruitment, manpower, professional or militia capacity, and capped discounts.
- Keeps Direct GM recruitment available as an explicit override.
- Lets assigned players rename regiments and replace each regiment image without changing the unit template.
- Provides world Rules for settlement thresholds, slots, economy, CP generation, and upkeep percentages.
- Prevents duplicate monthly processing with a per-settlement `lastProcessedMonth` record.
- Preserves De Laurent as an ordinary player settlement and uses a separate Starter Village template.
- Migrates v0.1.5 and older world data to schema v2 without deleting settlements, buildings, troops, queues, or logs.

See `KULLANIM-KILAVUZU.md` for the Turkish workflow and rule reference.

## Release

Repository:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System
```

Latest manifest:

```text
https://github.com/UmutcanOrug/FoundryVTT-Domain-System/releases/latest/download/module.json
```

Release assets:

- `module.json`
- `DS-vX.Y.Z.zip`
