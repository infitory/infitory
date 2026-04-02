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
  "Shadowrun 6e": `# System name
Shadowrun 6e

## Description
Shadowrun Sixth World Edition by Catalyst Game Labs. A cyberpunk-fantasy RPG set in the near future (2080s) where magic has returned to a world dominated by megacorporations. Players are Shadowrunners — deniable operatives who take on high-risk jobs for pay. The system uses pools of d6s — count hits (5 or 6). Metatypes include humans, elves, dwarves, orks, and trolls.

## Attributes
Body | Physical | number | min:1 | max:12
Agility | Physical | number | min:1 | max:12
Reaction | Physical | number | min:1 | max:12
Strength | Physical | number | min:1 | max:12
Willpower | Mental | number | min:1 | max:12
Logic | Mental | number | min:1 | max:12
Intuition | Mental | number | min:1 | max:12
Charisma | Social | number | min:1 | max:12
Edge | Special | number | min:1 | max:7
Magic / Resonance | Special | number | min:0 | max:12

## Derived stats
- Initiative = Reaction + Intuition + 1d6 (+ more dice for cyberware/magic)
- Composure = Willpower + Charisma
- Judge Intentions = Intuition + Charisma
- Memory = Logic + Willpower
- Lift/Carry = Body + Strength
- Physical Limit = (STRx2 + Body + Reaction) / 3, rounded up
- Mental Limit = (Logicx2 + Intuition + Willpower) / 3, rounded up
- Social Limit = (Charismx2 + Willpower + Essence) / 3, rounded up
- Essence: starts at 6.0; lost permanently with cyberware/bioware implants
- Condition Monitors: Physical = 8 + (Body/2); Stun = 8 + (Willpower/2)

## Character fields
Name | text
Player Name | text
Street Name | text
Metatype | select | Human, Elf, Dwarf, Ork, Troll
Archetype | select | Street Samurai, Decker, Technomancer, Mage, Shaman, Adept, Mystic Adept, Rigger, Face, Infiltrator, Weapons Specialist, Custom
Awakened / Emerged | select | Mundane, Awakened (Magician), Awakened (Adept), Awakened (Mystic Adept), Emerged (Technomancer)
Tradition (if Awakened) | text
Gender | text
Age | text
Reputation | number
Notoriety | number
Street Cred | number
Karma (Total) | number
Karma (Current) | number
Nuyen | number
Essence | number
Physical Damage Monitor | number
Stun Damage Monitor | number
Initiative Score | text
Primary Lifestyle | select | Squatter, Low, Medium, High, Luxury
SIN (System Identification Number) | text
Cyberware & Bioware | textarea
Gear & Weapons | textarea
Vehicles | textarea
Contacts | textarea
Qualities (Positive) | textarea
Qualities (Negative) | textarea
Spells / Powers / Complex Forms | textarea
Fake IDs & Licenses | textarea
Background | textarea
Notes | textarea

## Skills
Athletics | Agility
Biotech | Logic
Close Combat | Agility
Con | Charisma
Cracking | Logic
Electronics | Logic
Engineering | Logic
Exotic Weapons | Agility
Firearms | Agility
Influence | Charisma
Outdoors | Intuition
Perception | Intuition
Piloting | Reaction
Sorcery | Magic
Conjuring | Magic
Astral | Magic
Tasking | Resonance
Stealth | Agility
Throwing Weapons | Agility

## Dice
Build a pool: Attribute + Skill rating (sometimes Attribute + Attribute)
Roll all dice — each die showing 5 or 6 = 1 Hit
Threshold: number of Hits needed (usually 1-4; GM sets it)
Glitch: half or more of dice pool shows 1s = Glitch (minor complication)
Critical Glitch: half or more 1s AND zero Hits = Critical Glitch (serious consequence)

Opposed test: attacker rolls pool, defender rolls pool; compare net Hits (attacker Hits minus defender Hits)

Edge (Sixth Edition):
- Edge replaces the old limit system
- Gain Edge for smart play, clever tactics, good roleplay (max = Edge attribute)
- Spend Edge: pre-roll bonuses (add dice, reroll, etc.) or post-roll (buy Hit, add Hit to ally, etc.)
- Edge refreshes between scenes

Damage:
- Attack Rating (AR) of weapon vs Defence Rating (DR) of armour
- If AR >= DR: attacker gains 1 Edge
- If AR < DR: defender gains 1 Edge
- Net Hits from attack add to weapon's base damage value
- Defender resists with Body + armour bonus dice

Hacking (Decking): Logic + Cracking vs target's Firewall or Willpower
Matrix actions use Matrix Initiative and a separate Condition Monitor for the deck

## Notes
### Run Structure
Legwork: gather info on the target (contacts, Perception, Electronics, Con, Cracking)
The Run: infiltrate, acquire/eliminate the objective, exfiltrate
Debrief: get paid (Nuyen), earn Karma, update reputation

### Cyberware & Essence
Each piece of cyberware/bioware reduces Essence.
Lower Essence: reduces max Magic/Resonance (Awakened/Emerged lose power permanently).
Street Samurai and Riggers typically embrace cyberware; Mages avoid it.
Alphaware costs more but reduces half the Essence loss. Betaware/Deltaware even less.

### Matrix
The Matrix is the global AR/VR network. Deckers and Technomancers operate here.
Deckers use a cyberdeck; Technomancers use Resonance naturally.
Matrix has its own actions, initiatives, and damage track.
GOD (Grid Overwatch Division): tracks illegal Matrix activity; Overwatch Score (OS) rises with hacking. At 40 OS, GOD converges — very bad.

### Magic
Awakened characters access the Astral Plane.
Magicians: cast Spells (Sorcery) and summon Spirits (Conjuring).
Adepts: channel Magic as physical enhancements (Adept Powers).
Drain: after casting, resist Drain damage with Willpower + Magic (or Body for Adepts).

### Contacts
Contacts have Loyalty (1-6) and Connection (1-6).
Loyalty: how much they like you.
Connection: how useful/influential they are.
Use contacts for: information, gear, safe houses, fake IDs, muscle.
`,
  "Cyberpunk RED": `# System name
Cyberpunk RED

## Description
Cyberpunk RED by R. Talsorian Games. The latest edition of the classic cyberpunk RPG, set in the dark future of 2045 — the Time of the Red — after the Fourth Corporate War left Night City rebuilt and scarred. Players are Edgerunners: mercenaries, hackers, and street fighters scraping by in a world where corps own everything. Uses a d10-based system: roll d10 + stat + skill vs Difficulty Value (DV).

## Attributes
Intelligence | INT | number | min:2 | max:8
Reflexes | REF | number | min:2 | max:8
Dexterity | DEX | number | min:2 | max:8
Technology | TECH | number | min:2 | max:8
Cool | COOL | number | min:2 | max:8
Willpower | WILL | number | min:2 | max:8
Luck | LUCK | number | min:2 | max:8
Move | MOVE | number | min:2 | max:8
Body | BODY | number | min:2 | max:8
Empathy | EMP | number | min:2 | max:8

## Derived stats
- Humanity: EMP x 10 (at character creation); reduced by cyberware installation
- Max Humanity: determines EMP stat ceiling
- Hit Points: 10 + (5 x ((BODY + WILL) / 2, rounded up))
- Seriously Wounded threshold: HP / 2, rounded up
- Death Save: BODY attribute used to resist death
- Run speed: MOVE x 3 metres per round
- Carry: BODY x 10kg
- Humanity Loss per cyberware piece: varies; EMP = current Humanity / 10

## Character fields
Name | text
Player Name | text
Handle (Street Name) | text
Role | select | Exec, Fixer, Lawman, Media, Medtech, Netrunner, Nomad, Rockerboy, Solo, Tech
Lifestyle | select | Kibble (destitute), Streetrat, Modest, Comfortable, Well-Off, High, Corporate
Age | text
Gender | text
Style | text
Cultural Region | text
Hit Points (Max) | number
Hit Points (Current) | number
Humanity (Max) | number
Humanity (Current) | number
Death Save | number
Luck (Max) | number
Luck (Current) | number
Eurodollars | number
IP (Improvement Points) | number
Reputation | number
Primary Weapon | text
Secondary Weapon | text
Armour (Head SP) | number
Armour (Body SP) | number
Cyberware | textarea
Gear & Equipment | textarea
Vehicles | textarea
Contacts & Enemies | textarea
Background | textarea
Notes | textarea

## Skills
Concentration | WILL
Conceal/Reveal Object | INT
Lip Reading | INT
Perception | INT
Tracking | INT
Athletics | DEX
Contortionist | DEX
Dance | DEX
Endurance | WILL
Resist Torture/Drugs | WILL
Stealth | DEX
Drive Land Vehicle | REF
Pilot Air Vehicle | REF
Pilot Sea Vehicle | REF
Riding | REF
Shoulder Arms | REF
Handgun | REF
Brawling | DEX
Evasion | DEX
Melee Weapon | REF
Martial Arts | REF
Autofire | REF
Archery | REF
Heavy Weapons | REF
Education | INT
Bureaucracy | INT
Business | INT
Composition | INT
Criminology | INT
Cryptography | INT
Deduction | INT
Language (choose) | INT
Library Search | INT
Local Expert (choose) | INT
Science (choose) | INT
Tactics | INT
Wilderness Survival | INT
Bribery | COOL
Conversation | EMP
Human Perception | EMP
Interrogation | COOL
Persuasion | COOL
Personal Grooming | COOL
Streetwise | COOL
Trading | COOL
Wardrobe & Style | COOL
Accounting | INT
Animal Handling | INT
Demolitions | TECH
Disguise | COOL
Electronics/Security Tech | TECH
First Aid | TECH
Forgery | TECH
Land Vehicle Tech | TECH
Paramedic | TECH
Photography/Film | TECH
Pick Lock | TECH
Pick Pocket | DEX
Sea Vehicle Tech | TECH
Weaponstech | TECH

## Dice
All checks: d10 + Stat + Skill vs Difficulty Value (DV)
DV guide: Everyday 9, Competent 13, Professional 15, Heroic 19, Incredible 24
Critical Success: roll 10 — roll again, add result (keep going on further 10s)
Critical Failure: roll 1 — roll again, subtract result (keep going on further 1s)

Attack roll: d10 + REF + weapon skill vs DV 15 (Ranged) or target's DV (melee)
Defence: Evasion check or just DV 15 base for most attacks
Damage: weapon damage dice (e.g. pistol: 2d6, shotgun: 5d6) minus armour SP
Aimed shots: -8 to attack, but bypass armour on head/arms/legs

Luck: spend Luck points (1:1) to add to any roll before or after rolling; refreshes each session
Net check (Netrunning): INT + Interface vs Black ICE or DV of NET architecture node

## Notes
### Armour & Damage
Armour has Stopping Power (SP): subtract from damage received.
Armour ablates: each time it stops damage, roll 1d10 — on 1, SP decreases by 1.
Localised hits: head shots bypass body armour; targeted shots require aimed attack.
Seriously Wounded (at or below half HP): -2 to all actions until stabilised.

### Cyberware & Humanity
Installing cyberware costs Humanity (roll d6 or fixed amount).
Humanity / 10 (rounded down) = EMP stat.
At 0 Humanity: Cyberpsychosis — character becomes an NPC controlled by the GM.
Treating trauma and reconnecting with people can slowly restore Humanity.

### Netrunning
Netrunners access the NET: a dangerous digital architecture.
Each NET layer has Nodes: Password, File, Control, Black ICE.
Black ICE: hostile programs that attack the Netrunner's body through the interface.
Netrunners act on their own initiative in the NET while the team acts in meatspace.
Programmes: offensive (Sword, Hellbolt), defensive (Flak), utility (Worm, Banhammer).

### Roles & Role Abilities
Each Role has a unique ability that only they can use:
- Solo: Combat Awareness (bonus to initiative and defence)
- Netrunner: Interface (access the NET)
- Tech: Maker (craft and upgrade gear)
- Medtech: Medicine (surgery and stabilisation)
- Media: Credibility (reputation as a journalist)
- Exec: Teamwork (direct an NPC combat team)
- Lawman: Backup (call in law enforcement assets)
- Fixer: Operator (black market contacts and deals)
- Nomad: Moto (vehicle skills and clan contacts)
- Rockerboy: Charismatic Impact (crowd control and inspiration)

### Night City Slang
Choom: friend/buddy | Edgerunner: freelance mercenary | Flatline: kill/be killed
Gonk: idiot | Corpo: corporate employee | Borg: heavily cybered person
Nova: excellent/cool | Preem: premium/top quality | Boostergang: street gang
`,
  "Blades in the Dark": `# System name
Blades in the Dark

## Description
Blades in the Dark by John Harper (Evil Hat Productions). A game about a crew of scoundrels in Duskwall — a dark industrial fantasy city haunted by ghosts. Players plan heists, build a criminal empire, and deal with the consequences of their reckless lives. The system is narrative-first: roll a number of d6s, take the single highest result. No hit points — instead: Harm, Stress, and Trauma.

## Attributes
Insight | Mental | number | min:0 | max:4
Prowess | Physical | number | min:0 | max:4
Resolve | Social/Spiritual | number | min:0 | max:4

## Derived stats
- Action Ratings: 12 actions rated 0-4 (dots)
- Stress: tracks how hard you push; max 9; at 10 = Trauma
- Trauma: permanent scars on the character (Haunted, Paranoid, Reckless, etc.); at 4 = retire
- Harm: physical/mental wounds rated 1-3; each level applies a penalty to rolls
- Armour: check to reduce incoming Harm (lost for the session)
- Load: Light 3, Normal 5, Heavy 6 — choose before each score
- Coin: currency; Crew has Vault with max Coin; Tiers reflect power level
- Heat: how much the authorities are looking for the crew; reduces with downtime
- Wanted Level: how urgently law enforcement pursues the crew (0-4)
- Rep: crew's reputation in the criminal underworld

## Character fields
Name | text
Player Name | text
Playbook | select | Cutter, Hound, Leech, Lurk, Slide, Spider, Whisper
Vice | select | Faith, Gambling, Luxury, Obligation, Pleasure, Stupor, Weird
Stress (Max 9) | number | min:0 | max:9
Trauma | textarea
Harm (Level 1) | text
Harm (Level 2) | text
Harm (Level 3) | text
Armour | checkbox
Heavy Armour | checkbox
Special Armour | checkbox
Coin | number
Stash (long-term Coin) | number
Experience (Playbook XP) | number
Experience (Attribute XP) | text
Contacts / Friends | textarea
Rivals & Enemies | textarea
Special Abilities | textarea
Items (check when carried) | textarea
Notes | textarea

## Skills
Hunt | Insight
Study | Insight
Survey | Insight
Tinker | Insight
Finesse | Prowess
Prowl | Prowess
Skirmish | Prowess
Wreck | Prowess
Attune | Resolve
Command | Resolve
Consort | Resolve
Sway | Resolve

## Dice
Build your pool: base = Action Rating dots (0-4 d6s)
Push yourself (spend 2 Stress) OR accept a Devil's Bargain = +1d to pool
Assist (teammate spends 1 Stress) = +1d to pool
At zero dots: roll 2d6, take the lowest

Roll pool, take single highest die:
- 6: Full success — you do it, no cost
- 4-5: Partial success — you do it, but there's a cost (Harm, reduced effect, complication)
- 1-3: Bad outcome — things go badly; GM introduces a complication

Critical success: two or more 6s = exceptional result

Position (how risky the action is — set by GM):
- Controlled: low risk, good effect
- Risky: moderate risk, standard effect (default)
- Desperate: high risk, poor effect (but rolling desperate can give more effect)

Effect (how much impact your action has):
- Limited, Standard, or Great — modified by situation, tools, and Scale

Fortune rolls: no action rating, just relevant dots or flat d6 — used for NPC actions, random events

Resistance rolls: roll Attribute dice pool vs Harm or consequence — reduce or negate result; cost = Stress equal to (6 minus highest die)

## Notes
### The Score
A Score = a heist, job, or caper.
Approach: decide approach (Assault, Deception, Stealth, Occult, Social, Transport) — determines starting Position.
Planning phase: pick approach, name one key detail you've scouted/arranged — flashback fills the rest.
Engagement roll: determines opening situation when the score begins.

### Flashbacks
At any point during a score, any player can call a flashback.
The GM sets a cost (0-2 Stress) based on how plausible the flashback is.
Roll to see how well the prior preparation went.
Flashbacks replace lengthy planning phases — act first, explain how you prepared later.

### Downtime
After each score: Heat increases, then choose Downtime activities (usually 2):
- Acquire Asset: get gear, information, or a contact
- Long-Term Project: work on a multi-step goal (crafting, research, schemes)
- Recover: remove Harm
- Reduce Heat: lay low, bribe, or misdirect authorities
- Train: mark XP in an Attribute track
- Vice: indulge your Vice to clear Stress (roll your lowest Attribute; clear that many Stress)
  - Overindulgence: if you clear more than your max Stress, bad things happen

### The Crew
The Crew is a collective character:
- Crew Type: sets the crew's specialty (Assassins, Bravos, Cult, Hawkers, Shadows, Smugglers, Spectres)
- Tier: 0-4, reflects power and resources
- Hold: Strong or Weak — reflects stability
- Rep: earns Tier upgrades
- Upgrades: crew-wide advantages (better equipment, safe house, training bonus, etc.)
- Turf: territory the crew controls in Duskwall

### The Ghost Field (Electroplasm & Spirits)
Duskwall is surrounded by a lightning barrier that keeps ghosts contained.
The Void Sea and ghost field saturate the city — ghosts, demons, and spirits are real.
Whispers can Attune to the Ghost Field — commune with spirits, channel energy, bind ghosts.
Electroplasm (leviathan blood) powers the city's lightning towers and the criminal economy.
`,
  "Fate Core": ``,

};
