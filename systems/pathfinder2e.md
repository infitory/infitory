# System name
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
