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
  "Call of Cthulhu 7e": ``,
  "Vampire: the Masquerade 5e": ``,
  "Shadowrun 6e": ``,
  "Cyberpunk RED": ``,
  "Blades in the Dark": ``,
  "Fate Core": ``,

};
