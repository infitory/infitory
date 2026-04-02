'use strict';

// Pre-built system rulebooks bundled as JS strings so they work on file:// without a server.
// Keys are the canonical system names used for localStorage.

const BUNDLED_SYSTEMS = {

  "D&D 5e (2024)": `# System name
D&D 5e (2024)

## Description
Dungeons & Dragons 5th Edition (2024 revision). A high-fantasy tabletop RPG using d20-based mechanics. Players choose from 12 classes and numerous species to build heroes who explore dungeons, slay monsters, and shape the world. Based on SRD 5.2 (CC-BY-4.0).

## Attributes
Strength | STR | number | min:1 | max:30
Dexterity | DEX | number | min:1 | max:30
Constitution | CON | number | min:1 | max:30
Intelligence | INT | number | min:1 | max:30
Wisdom | WIS | number | min:1 | max:30
Charisma | CHA | number | min:1 | max:30

## Derived stats
- Ability Modifier = (Ability Score - 10) / 2, rounded down
- Proficiency Bonus: +2 (levels 1–4), +3 (5–8), +4 (9–12), +5 (13–16), +6 (17–20)
- Initiative = DEX modifier + any bonuses
- Armor Class (AC) = base armor + DEX modifier (varies by armor type)
- Hit Points (HP): roll Hit Die + CON modifier per level; maximised at level 1

## Character fields
Name | text
Player Name | text
Class | select | Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
Subclass | text
Species | text
Background | text
Alignment | select | Lawful Good, Neutral Good, Chaotic Good, Lawful Neutral, True Neutral, Chaotic Neutral, Lawful Evil, Neutral Evil, Chaotic Evil
Level | number | min:1 | max:20
Experience Points | number
Hit Points (Max) | number
Hit Points (Current) | number
Hit Dice | text
Armor Class | number
Initiative | number
Speed | number
Inspiration | checkbox
Proficiency Bonus | number
Passive Perception | number
Saving Throws (proficient) | text
Personality Traits | textarea
Ideals | textarea
Bonds | textarea
Flaws | textarea
Features & Traits | textarea
Equipment & Currency | textarea
Attacks & Spellcasting | textarea
Spell Slots | text

## Skills
Acrobatics | DEX
Animal Handling | WIS
Arcana | INT
Athletics | STR
Deception | CHA
History | INT
Insight | WIS
Intimidation | CHA
Investigation | INT
Medicine | WIS
Nature | INT
Perception | WIS
Performance | CHA
Persuasion | CHA
Religion | INT
Sleight of Hand | DEX
Stealth | DEX
Survival | WIS

## Dice
Standard roll: d20 + ability modifier + proficiency bonus (if proficient)
Advantage: roll 2d20, take highest
Disadvantage: roll 2d20, take lowest

Attack roll: d20 + ability modifier + proficiency bonus vs target AC
Damage roll: weapon die + ability modifier (e.g. longsword: 1d8+STR)
Saving throw: d20 + ability modifier + proficiency bonus (if proficient)
Skill check: d20 + ability modifier + proficiency bonus (if proficient)
Initiative: d20 + DEX modifier

Death saving throw: d20 — 10+ is a success, 1–9 is a failure (3 failures = death, 3 successes = stable)
Critical hit: natural 20 on attack roll — roll all damage dice twice

Common hit dice by class:
- d6: Sorcerer, Wizard
- d8: Bard, Cleric, Druid, Monk, Rogue, Warlock
- d10: Fighter, Paladin, Ranger
- d12: Barbarian

## Notes
### Combat order
1. Roll initiative (d20 + DEX mod) — highest goes first
2. On your turn: Move (up to Speed), Action, Bonus Action (if available), Free Object Interaction
3. Actions: Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use an Object
4. Reactions: once per round, triggered by specific events (e.g. Opportunity Attack, Shield spell)

### Conditions
Blinded, Charmed, Deafened, Exhaustion (6 levels), Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious

### Resting
Short Rest: 1+ hours — spend Hit Dice to recover HP
Long Rest: 8+ hours — regain all HP, half max Hit Dice, all spell slots, most class features
`,

  "Pathfinder 2e": `# System name
Pathfinder 2e

## Description
Pathfinder Second Edition by Paizo. A high-fantasy d20 RPG known for its tactical depth, vast customisation, and three-action economy. Characters are built through a combination of ancestry, background, and class, layered with feats at every level. Rules available freely at Archives of Nethys (2e.aonprd.com) under the ORC license.

## Attributes
Strength | STR | number | min:1 | max:30
Dexterity | DEX | number | min:1 | max:30
Constitution | CON | number | min:1 | max:30
Intelligence | INT | number | min:1 | max:30
Wisdom | WIS | number | min:1 | max:30
Charisma | CHA | number | min:1 | max:30

## Derived stats
- Ability Modifier = (Ability Score - 10) / 2, rounded down
- Proficiency Bonus by rank: Untrained +0, Trained +Level+2, Expert +Level+4, Master +Level+6, Legendary +Level+8
- Check = d20 + relevant modifier + proficiency bonus + item bonus + status bonus + circumstance bonus
- AC = 10 + DEX mod + armor item bonus + proficiency bonus + level (if trained)
- Hit Points = class base HP + CON modifier + ancestry HP (per level)

## Character fields
Name | text
Player Name | text
Class | select | Alchemist, Barbarian, Bard, Champion, Cleric, Druid, Fighter, Gunslinger, Inventor, Investigator, Kineticist, Magus, Monk, Oracle, Psychic, Ranger, Rogue, Sorcerer, Summoner, Swashbuckler, Thaumaturge, Witch, Wizard
Subclass / Archetype | text
Ancestry | text
Heritage | text
Background | text
Alignment | select | Lawful Good, Neutral Good, Chaotic Good, Lawful Neutral, True Neutral, Chaotic Neutral, Lawful Evil, Neutral Evil, Chaotic Evil
Level | number | min:1 | max:20
Experience Points | number
Hit Points (Max) | number
Hit Points (Current) | number
Armor Class | number
Speed | number
Class DC | number
Perception | number
Fortitude Save | number
Reflex Save | number
Will Save | number
Hero Points | number | min:0 | max:3
Resonance Points | number
Bulk Limit | number
Ancestry Feats | textarea
Class Feats | textarea
General Feats | textarea
Skill Feats | textarea
Spells & Focus Points | textarea
Equipment & Bulk | textarea
Notes | textarea

## Skills
Acrobatics | DEX
Arcana | INT
Athletics | STR
Crafting | INT
Deception | CHA
Diplomacy | CHA
Intimidation | CHA
Lore (choose) | INT
Medicine | WIS
Nature | WIS
Occultism | INT
Performance | CHA
Religion | WIS
Society | INT
Stealth | DEX
Survival | WIS
Thievery | DEX

## Dice
All checks: d20 + modifier + proficiency + bonuses vs Difficulty Class (DC)

Degree of Success:
- Critical Success: beat DC by 10+ (or natural 20 that succeeds)
- Success: meet or beat DC
- Failure: miss DC by 1–9
- Critical Failure: miss DC by 10+ (or natural 1 that fails)

Attack roll: d20 + attack modifier vs target AC
Multiple Attack Penalty (MAP): 2nd attack –5, 3rd+ attack –10 (agile weapons: –4/–8)
Damage: weapon die + STR (or DEX for finesse/ranged) + bonuses

Saving throw: d20 + save modifier vs spell/ability DC
Skill check: d20 + skill modifier vs DC

## Notes
### Three-Action Economy
Each turn you have 3 Actions and 1 Reaction.
Common action costs:
- 1 Action: Strike, Step, Stride, Interact, Cast cantrip (usually), Raise a Shield
- 2 Actions: Cast most spells, Sudden Charge, Command an Animal
- 3 Actions: Cast some spells, Heroic Recovery
- Free Action: Release a held item, certain triggered abilities
- Reaction: Attack of Opportunity (Fighters), Shield Block, Grab an Edge

### Conditions
Conditions have numerical values (e.g. Frightened 2, Drained 1) or are binary (Paralyzed, Prone).
Key conditions: Blinded, Confused, Dazzled, Drained, Dying, Enfeebled, Fascinated, Fatigued, Fleeing, Frightened, Grabbed, Immobilized, Off-Guard (formerly Flat-Footed), Paralyzed, Petrified, Poisoned, Prone, Quickened, Restrained, Sickened, Slowed, Stunned, Unconscious, Wounded

### Resting
Rest (8 hours): recover all HP, clear most conditions, recover spell slots
Treat Wounds: Medicine check during 10-minute activity to heal HP out of combat

### Hero Points
Gain 1 Hero Point at session start, more for good roleplay.
Spend 1: reroll any die roll, keep new result
Spend all 3: avoid dying (stabilise at 0 HP instead)
`,
  "Starfinder": `# System name
Starfinder

## Description
Starfinder by Paizo. A science-fantasy RPG set in a far future where magic and technology coexist. Built on a d20 system similar to Pathfinder 1e but streamlined. Players crew starships, explore alien worlds, and fight enemies ranging from space goblins to eldritch horrors. Rules available at Archives of Nethys (aonsrd.com).

## Attributes
Strength | STR | number | min:1 | max:30
Dexterity | DEX | number | min:1 | max:30
Constitution | CON | number | min:1 | max:30
Intelligence | INT | number | min:1 | max:30
Wisdom | WIS | number | min:1 | max:30
Charisma | CHA | number | min:1 | max:30

## Derived stats
- Ability Modifier = (Ability Score - 10) / 2, rounded down
- Base Attack Bonus (BAB): varies by class and level
- Armor Class (EAC): 10 + DEX mod + armor EAC bonus — used vs energy attacks
- Armor Class (KAC): 10 + DEX mod + armor KAC bonus — used vs kinetic attacks
- Stamina Points (SP): recover after 10-minute rest; act as a buffer before HP
- Hit Points (HP): class base + CON mod; harder to recover (require rest or medicine)
- Resolve Points (RP): class-based resource for special abilities and death prevention

## Character fields
Name | text
Player Name | text
Class | select | Biohacker, Envoy, Evolutionist, Mechanic, Mystic, Nanocyte, Operative, Precog, Soldier, Solarian, Technomancer, Vanguard, Witchwarper
Archetype | text
Race / Ancestry | text
Theme | select | Ace Pilot, Bounty Hunter, Icon, Mercenary, Outlaw, Priest, Scholar, Spacefarer, Xenoseeker, Themeless
Alignment | select | Lawful Good, Neutral Good, Chaotic Good, Lawful Neutral, True Neutral, Chaotic Neutral, Lawful Evil, Neutral Evil, Chaotic Evil
Level | number | min:1 | max:20
Experience Points | number
Stamina Points (Max) | number
Stamina Points (Current) | number
Hit Points (Max) | number
Hit Points (Current) | number
Resolve Points (Max) | number
Resolve Points (Current) | number
Energy AC (EAC) | number
Kinetic AC (KAC) | number
Initiative | number
Speed | number
Base Attack Bonus | number
Fortitude Save | number
Reflex Save | number
Will Save | number
Credits | number
Bulk Limit | number
Augmentations | textarea
Weapons & Equipment | textarea
Class Features | textarea
Spells / Abilities | textarea
Starship Role | select | Captain, Engineer, Gunner, Magic Officer, Pilot, Science Officer, Chief Mate, Crew
Notes | textarea

## Skills
Acrobatics | DEX
Athletics | STR
Bluff | CHA
Computers | INT
Culture | INT
Diplomacy | CHA
Disguise | CHA
Engineering | INT
Intimidate | CHA
Life Science | INT
Medicine | INT
Mysticism | WIS
Perception | WIS
Physical Science | INT
Piloting | DEX
Profession (choose) | varies
Sense Motive | WIS
Sleight of Hand | DEX
Stealth | DEX
Survival | WIS

## Dice
Attack roll: d20 + BAB + ability modifier + bonuses vs EAC or KAC
Skill check: d20 + skill ranks + ability modifier + class skill bonus (+3) vs DC
Saving throw: d20 + save modifier + ability modifier vs DC

Critical hit: natural 20 — deal normal damage and apply weapon's critical effect
Trick Attack (Operative): make Bluff/Intimidate/Stealth check vs DC 20+ enemy's CR; add 1d4 damage (scales with level)

Starship combat dice: varies — gunners roll d20 + gunnery + weapon bonus vs enemy TL

## Notes
### Action Economy
Standard Action: attack, activate item, cast spell
Move Action: move up to Speed, draw/holster weapon, stand from prone
Swift Action: small actions (once per turn)
Full Action: full attack (2 attacks at –4/–8), run, charge
Reaction: once per round when triggered

### Stamina & Resolve
Stamina Points go first — like a shield around your HP.
After 10-minute rest: spend 1 Resolve Point to fully recover all Stamina Points.
At 0 HP: spend 1 RP to stay at 1 HP (Resolve to Survive). At 0 RP and 0 HP: dying.
Death: at negative HP equal to your CON score, you die.

### Starship Combat
Separate system with its own phases: Engineering, Helm, Gunnery.
Each player fills a role on the ship. Rounds are simultaneous.
Ship stats: HP, Shields (fore/aft/port/starboard), AC, TL, Speed, Maneuverability, Power Core.

### Conditions
Bleeding, Blinded, Broken, Burning, Confused, Cowering, Dazed, Dazzled, Dead, Deafened, Dying, Encumbered, Entangled, Exhausted, Fascinated, Fatigued, Flat-Footed, Frightened, Grappled, Helpless, Nauseated, Off-Target, Overburdened, Panicked, Paralyzed, Pinned, Prone, Shaken, Sickened, Stable, Staggered, Stunned, Unconscious
`,
  "Call of Cthulhu 7e": `# System name
Call of Cthulhu 7e

## Description
Call of Cthulhu by Chaosium. A horror roleplaying game set in the 1920s (or other eras) based on the works of H.P. Lovecraft. Investigators uncover cosmic horrors that slowly erode their sanity. The system uses percentile dice (d100) — roll under your skill value to succeed. Characters are fragile, sanity is precious, and death is often preferable to what waits beyond.

## Attributes
Strength | STR | number | min:1 | max:100
Constitution | CON | number | min:1 | max:100
Size | SIZ | number | min:1 | max:100
Dexterity | DEX | number | min:1 | max:100
Appearance | APP | number | min:1 | max:100
Intelligence | INT | number | min:1 | max:100
Power | POW | number | min:1 | max:100
Education | EDU | number | min:1 | max:100

## Derived stats
- Hit Points = (CON + SIZ) / 10, rounded down
- Sanity (starting) = POW
- Sanity (max) = 99 minus Cthulhu Mythos skill
- Magic Points = POW / 5, rounded down
- Luck = 3d6 x 5 (rolled separately, not averaged)
- Damage Bonus: based on STR + SIZ total (see table)
- Build: -2 (under 64), -1 (65-84), 0 (85-124), +1 (125-164), +2 (165-204)
- Move Rate: 7 (standard); modified by STR/DEX/SIZ comparisons with opponents
- Half skill value = regular difficulty threshold
- Fifth of skill value = hard difficulty threshold

## Character fields
Name | text
Player Name | text
Occupation | text
Age | number
Gender | text
Residence | text
Birthplace | text
Era | select | 1920s, Modern Day, Dark Ages, Gaslight (Victorian), Ancient Rome, Custom
Hit Points (Max) | number
Hit Points (Current) | number
Sanity (Max) | number
Sanity (Current) | number
Magic Points (Max) | number
Magic Points (Current) | number
Luck | number
Damage Bonus | text
Build | number
Move Rate | number
Temporary Insanity | checkbox
Indefinite Insanity | checkbox
Injuries & Marks | textarea
Phobias & Manias | textarea
Fellow Investigators & Contacts | textarea
Equipment & Cash | textarea
Treasured Possessions | textarea
Background & Backstory | textarea
Cthulhu Mythos Knowledge | number
Notes | textarea

## Skills
Accounting | EDU-based
Anthropology | EDU-based
Appraise | INT-based
Archaeology | EDU-based
Art & Craft (choose) | DEX-based
Charm | APP-based
Climb | STR/DEX
Computer Use | EDU-based
Credit Rating | varies
Cthulhu Mythos | none
Disguise | APP-based
Dodge | DEX x2
Drive Auto | DEX-based
Electrical Repair | INT-based
Fast Talk | APP-based
Fighting (Brawl) | STR/DEX
Firearms (Handgun) | DEX-based
Firearms (Rifle/Shotgun) | DEX-based
First Aid | DEX-based
History | EDU-based
Intimidate | STR/CHA
Jump | STR/DEX
Language (Other) | EDU-based
Language (Own) | EDU x5
Law | EDU-based
Library Use | INT-based
Listen | INT-based
Locksmith | DEX-based
Mechanical Repair | DEX-based
Medicine | EDU-based
Natural World | INT/EDU
Navigate | INT-based
Occult | INT-based
Persuade | APP-based
Psychology | INT-based
Psychoanalysis | EDU-based
Science (choose) | EDU-based
Sleight of Hand | DEX-based
Spot Hidden | INT-based
Stealth | DEX-based
Survival | INT-based
Swim | STR/CON
Throw | DEX-based
Track | INT-based

## Dice
All skill checks: roll d100, succeed if result is equal to or under skill value
Regular success: roll equal to or under skill value
Hard success: roll equal to or under half skill value
Extreme success: roll equal to or under one fifth of skill value
Fumble: roll 96-100 (or 100 if skill is 50 or less)

Bonus die: roll 2d10 for the tens digit, take the lower — awarded by the Keeper for favourable circumstances
Penalty die: roll 2d10 for the tens digit, take the higher — imposed for unfavourable circumstances

Opposed checks: both roll; higher level of success wins (ties go to higher skill)

Damage:
- Fist/kick: 1d3 + DB
- Small knife: 1d4 + DB
- Handgun: 1d10
- Rifle: 2d6+4
- Shotgun: 4d6 (close range)

Sanity loss: varies by encounter — e.g. seeing a ghoul: 0/1d6 (success/fail)

## Notes
### Sanity
Sanity Points (SAN) range from 0 to 99.
Losing 5+ SAN in one roll = temporary insanity.
Losing 20% of current SAN in one session = indefinite insanity.
At SAN 0: permanent insanity.
Recovery: Psychoanalysis skill, time, successful adventures.
Learning Cthulhu Mythos permanently lowers maximum Sanity.

### Combat
Initiative: DEX order (highest first). No separate roll.
On your turn: 1 action (attack, use item, cast spell, move, etc.)
Fighting back: choose to fight back (opposed roll) instead of Dodge — if you lose, you take damage
Dodge: use Dodge skill to avoid an attack entirely

### Pushing a Roll
If you fail a skill check, you may push it once — attempt again with a penalty.
If you fail the pushed roll, something bad happens (Keeper decides).
Some skills cannot be pushed (Cthulhu Mythos, Luck).

### Eras
The default era is the 1920s. The Keeper can set the game in modern day, the Victorian era, ancient history, or any custom era — adjust available skills and equipment accordingly.
`,
  "Vampire: the Masquerade 5e": `# System name
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
- Humanity: starts at 7; ranges 0-10; lower = more monstrous
- Hunger: starts at 1; ranges 0-5; increases without feeding; never goes below 1 without feeding
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
Roll all dice — count successes (each die showing 6-9 = 1 success, 10 = 2 successes)
Difficulty: number of successes required (default = 1)
Critical success: two or more 10s in the same roll = messy critical if any Hunger 10s involved

Hunger dice outcomes:
- Hunger die shows 1 = Bestial Failure risk (if the roll also fails overall)
- Hunger die shows 10 = Messy Critical (success, but with uncontrolled vampiric excess)

Opposed rolls: both sides roll pools; most successes wins (ties go to the active party)
Rouse Check: roll 1d10 — on a 1-5, Hunger increases by 1

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
`,
  "Shadowrun 6e": ``,
  "Cyberpunk RED": ``,
  "Blades in the Dark": ``,
  "Fate Core": ``,

};
