# System name
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
