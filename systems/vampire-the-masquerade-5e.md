# System name
Vampire: the Masquerade 5e

## Description
Vampire: the Masquerade (V5) by Renegade Game Studios / Paradox. A gothic horror RPG in the World of Darkness. Players are Kindred — vampires struggling with their Beast, navigating political intrigue between vampire factions (Sects), and clinging to what remains of their humanity. Uses a pool of d10s — count successes (6+). Hunger dice replace some regular dice and introduce risk.

## Attributes
Strength | Physical | number | min:1 | max:5
Dexterity | Physical | number | min:1 | max:5
Stamina | Physical | number | min:1 | max:5
Charisma | Social | number | min:1 | max:5
Manipulation | Social | number | min:1 | max:5
Composure | Social | number | min:1 | max:5
Intelligence | Mental | number | min:1 | max:5
Wits | Mental | number | min:1 | max:5
Resolve | Mental | number | min:1 | max:5

## Derived stats
- Dice pool = Attribute + Skill (add relevant dots together)
- Health = Stamina + 3
- Willpower = Composure + Resolve
- Humanity: starts at 7; ranges 0–10; lower = more monstrous
- Hunger: starts at 1; ranges 0–5; increases without feeding; never goes below 1 without feeding
- Blood Potency: increases with age; affects feeding and Discipline power
- Defense (Avoid): Wits + Dexterity (used in contested defence)
- Initiative = Composure + Wits (usually just determines who acts first)

## Character fields
Name | text
Player Name | text
Concept | text
Chronicle | text
Ambition | text
Desire | text
Clan | select | Banu Haqim, Brujah, Gangrel, Hecata, Lasombra, Malkavian, Ministry, Nosferatu, Ravnos, Salubri, Toreador, Tremere, Tzimisce, Ventrue, Caitiff, Thin-Blood
Generation | select | 4th, 5th, 6th, 7th, 8th, 9th, 10th, 11th, 12th, 13th, 14th, 15th, Thin-Blood
Predator Type | select | Alleycat, Bagger, Blood Leech, Consensualist, Farmer, Osiris, Sandman, Scene Queen, Siren
Sect | select | Anarch, Camarilla, Hecata, Inconnu, Independent, Sabbat
Coterie | text
Sire | text
Embraced (Year) | text
Apparent Age | text
Date of Birth | text
Health (Max) | number
Health (Current) | number
Willpower (Max) | number
Willpower (Current) | number
Humanity | number | min:0 | max:10
Hunger | number | min:0 | max:5
Blood Potency | number | min:0 | max:10
Experience (Total) | number
Experience (Spent) | number
True Faith (if any) | number
Stains | number
Disciplines | textarea
Advantages | textarea
Flaws | textarea
Touchstones & Convictions | textarea
Feeding Grounds & Haven | textarea
Allies, Contacts, Enemies | textarea
Background & History | textarea
Notes | textarea

## Skills
Athletics | Physical
Brawl | Physical
Craft | Physical
Drive | Physical
Firearms | Physical
Melee | Physical
Larceny | Physical
Stealth | Physical
Survival | Physical
Animal Ken | Social
Etiquette | Social
Insight | Social
Intimidation | Social
Leadership | Social
Performance | Social
Persuasion | Social
Streetwise | Social
Subterfuge | Social
Academics | Mental
Awareness | Mental
Finance | Mental
Investigation | Mental
Medicine | Mental
Occult | Mental
Politics | Mental
Science | Mental
Technology | Mental

## Dice
Build a pool: Attribute + Skill (e.g. Dexterity + Stealth)
Replace X dice with Hunger dice (X = current Hunger level)
Roll all dice — count successes (each die showing 6–9 = 1 success, 10 = 2 successes)
Difficulty: number of successes required (default = 1)
Critical success: two or more 10s in the same roll = messy critical if any Hunger 10s involved

Hunger dice outcomes:
- Hunger die shows 1 = Bestial Failure risk (if the roll also fails overall)
- Hunger die shows 10 = Messy Critical (success, but with uncontrolled vampiric excess)

Opposed rolls: both sides roll pools; most successes wins (ties go to the active party)
Rouse Check: roll 1d10 — on a 1–5, Hunger increases by 1

Disciplines (examples):
- Blood Surge: spend Rouse Check → add Blood Potency to a Physical dice pool for one roll
- Willpower: spend 1 Willpower → reroll up to 3 non-Hunger dice OR add 2 dice to a pool

## Notes
### The Hunger System
Hunger starts at 1 and rises when you use Blood Surge, heal, use Disciplines (Rouse Checks), or miss a feeding.
Hunger falls when you feed (amount depends on prey and Blood Potency).
At Hunger 5: must make a Frenzy check whenever provoked.
Hunger 0 is only possible right after a full feed — it quickly returns to 1.

### Frenzy
Provoked by: hunger, pain, anger, humiliation, fire, sunlight.
Frenzy check: Composure + Resolve vs difficulty set by Storyteller.
In Frenzy: character becomes the Beast — attacks, feeds, or flees uncontrollably.
Ride the Wave: succeed at a harder check to stay conscious during Frenzy and direct it.

### Humanity
Acts against your Convictions earn Stains (tracked separately).
At session end: check if Stains require a Humanity degeneration roll.
Losing Humanity: character becomes more monstrous, may gain Compulsions, eventually becomes an NPC.
Gaining Humanity: rare, requires meaningful acts of redemption and Storyteller approval.

### Clans & Disciplines
Each Clan has 3 signature Disciplines. Purchasing in-clan Disciplines costs 5xp per dot; out-of-clan costs 6xp (and requires a teacher or the blood of someone with that Discipline).

Common Disciplines:
- Animalism: control animals and the Beast in others
- Auspex: heightened senses, read auras, telepathy
- Blood Sorcery (Tremere): rituals and blood magic
- Celerity: supernatural speed and extra actions
- Dominate: mental commands, memory erasure
- Fortitude: resist damage, ignore pain
- Obfuscate: invisibility and illusion
- Potence: supernatural strength
- Presence: emotional manipulation and awe
- Protean (Gangrel): shapeshift, merge with earth, bat/wolf form

### The Masquerade
The Masquerade: the secret that vampires exist. Violating it earns Masquerade Breaches.
Sects enforce the Masquerade differently: the Camarilla rigidly, the Anarchs loosely.
