# Changelog

## 0.1.10

- Fixed Laurent Manor assignments being forced back to zero; it now requires and preserves 5 assigned POP, and its recruitment, Military Capacity, Defense, Public Order, and bonus-slot effects work at full staffing.
- Added a targeted schema v6 repair that converts v0.1.9 Laurent Manor instances to 5/5 staffing without resetting custom GM economy or rules values.
- Fixed the misleading military-capacity warning caused by the inactive Manor effects in migrated De Laurent settlements.
- Rebuilt the Overview branch picker on a fully opaque surface with higher-contrast nodes and a fixed Building Details panel; hover/focus updates the panel instead of opening overlapping tooltips.
- Separated replenishment from normal recruitment orders in the UI and month processor.
- Replenishment now resolves at month end without spending building recruitment capacity, while retaining its manpower reservation, partial Crown cost, source-building, and Military Capacity requirements.
- Expanded migration, capacity-bypass, branch-detail, and rendered-template regression coverage.

## 0.1.9

- Rebuilt Overview as a stable paged 4x2 district board over the settlement background; selecting a slot now opens a separate Total War-style branch overlay instead of expanding the card column.
- Added compact vertical T1-T5 branch trees with side-by-side choices, hover infoboxes, current/completed/future states, and direct comparisons against the currently owned node.
- Converted Laurent Manor into one tierless, unstaffed Landmark that grants its fixed benefits without consuming a normal district; migrated all legacy Laurent Estate stages into the landmark.
- Rebalanced Food development into meaningful Grain and Pastoral sidegrades: grain favors raw Food and famine security, while pastoral development favors Crown, growth, horses, and cavalry support.
- Removed Public Order output from built-in Food buildings and clarified strategic descriptions across Food, Materials, Commerce, and Civic branches.
- Replaced the derived manpower display with a persistent reserve. Recruitment and replenishment spend reserve, cancelled orders refund untrained reserve, and each processed month recovers 10% of manpower cap by default.
- Added explicit Public Order bands with visible growth and d100 modifiers: Unrest, Unstable, Stable, Content, and Prosperous.
- Added settlement-tier Defense targets, coverage states, garrison contribution, and capped raid/event mitigation so Defense has an inspectable gameplay purpose.
- Replaced flat event resource grants and losses with GM-editable timed percentage modifiers for income, upkeep, Food, Materials, construction, recruitment, military upkeep, growth, and Public Order.
- Added Apply Modifier, Narrative Only, Reroll, Ignore, active-modifier display, duration countdown, manual GM removal, and snapshot support for event modifiers.
- Expanded Rules, GM rule editors, ledger controls, Content Library fields, migration coverage, and automated tests for the new reserve, landmark, branch, Defense, Public Order, and event contracts.

## 0.1.8

- Migrated world data to schema v4 and force-refreshed stale built-in branch data so directly placed Infantry Yards correctly develop into Drill Hall or Stable Compound.
- Fixed settlement downgrades retaining empty Metropolis districts; slots now shrink to the new tier while preserving occupied and required support slots.
- Rebalanced every built-in economic building so full staffing is at least as profitable as leaving the same workers as Free POP, while keeping City and Metropolis investments expensive.
- Added tier-based Free POP Crown income of 10/20/30/40/50 from Hamlet through Metropolis.
- Replaced the old Land/Resources catalog with separated Food and Materials branches; built-in Food nodes no longer produce Materials and Materials nodes no longer produce Food.
- Removed legacy branchless economic templates from the active catalog and expanded migration mappings for existing settlements and projects.
- Replaced Professional/Militia capacity with one readable Military Capacity pool.
- Replaced Quality and seven combat attributes with one GM-editable Power value per unit.
- Added distinct T4-T5 elite rosters for War College, Knightly Order, Imperial Marksmen Academy, Royal Arsenal, and Grand Arsenal branches.
- Changed manpower to use Total POP at a default 100% rate; soldiers no longer subtract civilian POP and 309 POP now normally provides 309 manpower cap.
- Added Current/Maximum regiment strength, casualty editing, partial-cost replenishment orders, manpower reservation, and monthly recruitment-capacity processing.
- Added per-soldier Food consumption and included Army Food in monthly settlement consumption.
- Added tier-gated settlement policies for expanded rations, heavy taxation, war taxes, muster reserves, public festivals, and balanced administration.
- Limited player recruitment cards to units unlocked by completed staffed buildings while retaining Direct GM recruitment as an explicit override.
- Rebuilt Construction and Content Library around color-coded vertical T1-T5 branch trees with hover infoboxes, descriptions, effects, costs, parents, and recruited units.
- Grouped Content Library building editors by Food, Materials, Commerce, Civic, Recruitment, Defense, Siege, and Laurent Estate branches.
- Reworked regiment and recruitment cards into a maximum two-column layout with simplified Power, Food, cost, strength, Actor, image, and replenishment controls.
- Replaced free-text terrain/biome entry with checkbox sets plus strategic-resource and custom-tag controls.
- Expanded Rules into an in-module player handbook covering POP, income, Food, Materials, CP, branch construction, manpower, replenishment, Public Order, events, and policies.
- Rebuilt De Laurent's default and migration data around Village-appropriate T1-T2 buildings and refunded its obsolete sample T3 project.

## 0.1.7

- Migrated world data to schema v3 with Crown, Food, Materials, Public Order, manpower, strategic tags, defense, army power, pending events, and turn snapshots.
- Rebalanced the full economy for high-level campaigns where 20,000 Crown is a common player reward; City and Metropolis investments now extend into the millions.
- Replaced the broad economic catalog with four readable five-tier families: Land, Resources, Commerce, and Civic development.
- Rebuilt military development as five-tier Recruitment, Defense, Siege, and GM-only Laurent Estate families.
- Added explicit Infantry, Archery, Stable, Cavalry, Marksmen, War College, Knightly Order, and Arsenal branch progression.
- Aligned every building node tier with Hamlet, Village, Town, City, or Metropolis and enforced direct parent branches, unique families, limits, strategic resources, and multi-slot reservations.
- Made Overview district cards clickable for root construction and branch development over an optional GM-configured settlement background.
- Added Food and Materials construction costs, progress-sensitive cancellation refunds, staffed output scaling, bonus district slots, and clearer support-slot presentation.
- Reworked manpower so raised troops consume population, recruitment orders reserve manpower, and the UI separately explains civilian workers, military staff, Army POP, pool, queued, and available values.
- Added abstract unit Quality and seven 0-10 combat attributes with calculated unit combat and regiment power.
- Added optional Foundry Actor UUID links for unit templates, recruitment records, and individual regiments, including Actor drag/drop and sheet opening.
- Limited regiment management to two cards per row on wide screens and one on compact screens.
- Added Blank Hamlet, Starter Hamlet, Starter Village, and Starter Town templates plus custom template creation and save-current-settlement workflows.
- Added direct GM settlement tier changes, resource/manpower corrections, building placement, regiment creation, recruitment records, queue repair, and settlement board appearance controls.
- Added a GM-approved d100 month-event system with editable effects, Public Order and Food modifiers, Defense/mitigation reductions, Apply, Reroll, and Ignore decisions.
- Added pre-turn settlement snapshots and GM restoration without rewinding the global month number.
- Serialized module actions on the responsible GM to prevent overlapping saves from rapid or simultaneous controls.
- Expanded schema migration, five-tier catalog, resources, staffing, branch, manpower, Actor, event, snapshot, and responsive UI regression tests.

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
