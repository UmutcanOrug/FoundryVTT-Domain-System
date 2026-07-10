# Changelog

## 0.1.6

- Added schema v2 migration with persistent world Rules, settlement tiers, real district slots, and per-settlement month tracking.
- Preserved De Laurent as an ordinary player settlement and added a separate Starter Village template for new settlements.
- Added Hamlet, Village, Town, City, and Metropolis progression projects driven by POP, Crown, and construction CP.
- Replaced generic building levels with explicit Economic and Military building trees, direct parent branches, and slot-bound upgrades.
- Rebuilt the economic catalog around long-term timber, leather, stone, iron, grain, livestock, harbor, orchard, medicine, trade, and logistics investment chains.
- Rebuilt military development around Barracks infantry, archery, stable, watch, defense, and siege branches.
- Removed Special as a third category; Special is now an optional marker on Economic or Military buildings.
- Added tier-granted, purchasable, GM-locked, and category-restricted settlement slots.
- Preserved Free POP as the base CP source, added dynamic completion estimates, tier-based parallel projects, weighted CP sharing, CP overflow, and one-use hired CP.
- Rebalanced taxes, building output, recruitment prices, and regiment upkeep for high-level 5e-scale Treasure values.
- Added building-specific `Can Recruit Units`, capped recruitment and upkeep discounts, and world upkeep percentage rules.
- Changed recruitment completion to create one persistent regiment per order instead of merging every unit of the same type.
- Allowed assigned players to rename regiments and set regiment-specific images and notes without changing the global unit template.
- Added GM-editable world month, selected-settlement processing, pending-only global month close, and duplicate-process protection.
- Reorganized the player UI into Overview, Town, Construction, Recruitment, Chronicle, and Rules with slot-first construction and visual branch rows.
- Added automated migration, branch construction, recruitment, regiment, progression, slot unlock, and individual-turn regression tests.

## 0.1.5

- Rebuilt the module around a Total War-style catalog, queue, completion, and upgrade loop.
- Added a GM-only Content Library with editable building and unit templates, images, costs, requirements, capacities, upkeep, and unit unlocks.
- Replaced direct completed-building placement as the primary flow with a Building Browser and construction queue.
- Construction now validates terrain, prerequisite buildings, slots, target level, and Treasure before charging the cost up front.
- Only the first construction project advances each month; queue order can be changed and cancellations refund paid Crown.
- Completing a project creates the building or upgrades the existing building instead of creating duplicates.
- Added recruitable unit cards driven by completed buildings and their configured unit unlocks.
- Recruitment now validates source building, per-month capacity, professional or militia capacity, manpower, and Treasure.
- Recruitment costs are paid when queued; cancellation refunds untrained units.
- Preserved Direct GM recruitment as a zero-cost, no-building-requirement override.
- Added separate player permissions for construction and recruitment management.
- Replaced per-settlement month advancement with one global End Turn action that processes every settlement and advances the month once.
- Reduced and reorganized the UI into Overview, Domain, Construction, Recruitment, Growth, Chronicle, Content Library, and GM Controls.
- Added responsive layouts tested at desktop, compact window, and phone widths.
- Added automatic migration for legacy building recruitment fields and persistent logic/UI test harnesses.

## 0.1.4

- Added Direct GM recruitment source with no building requirement.
- Add Recruitment now creates a direct GM order even when no building exists.
- Direct GM recruitment marked as Recruiting completes its target on monthly processing.

## 0.1.3

- Added Stellaris-style settlement management overview with hero image, advisor portrait, district cards, unit cards, and biome/system panel.
- Added GM Presentation Studio for settlement image, advisor portrait, biome notes, system notes, and player assignment.
- Added image URL/FilePicker slots for buildings and unit rows.
- Added GM Asset Slots for quick special building, unit, and recruitment order creation.

## 0.1.2

- Recruitment can now use special buildings as valid sources.
- Add Recruitment can create a planned order from special or military buildings even before Recruit / Level is configured.
- Recruitment source labels now show when a source still needs setup.

## 0.1.1

- Added Treasure tracking and monthly net income transfer into Treasure.
- Added GM-editable troop role, garrison upkeep, and campaign upkeep.
- Added building recruitment settings and Military tab recruitment orders.
- Added monthly recruitment processing from active building capacity.

## 0.1.0

- Initial clean DS module release for Foundry VTT v13 build 351.
- Built from the working SWADE Dominion Train module structure.
- Added `K` key panel opening.
- Added settlement data, De Laurent sample settlement, calculations, Turn Note, Event Log, and GM monthly turn processing.
