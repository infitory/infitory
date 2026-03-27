# System name
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
- Humanity: EMP × 10 (at character creation); reduced by cyberware installation
- Max Humanity: determines EMP stat ceiling
- Hit Points: 10 + (5 × ((BODY + WILL) / 2, rounded up))
- Seriously Wounded threshold: HP / 2, rounded up
- Death Save: BODY attribute used to resist death
- Run speed: MOVE × 3 metres per round
- Carry: BODY × 10kg
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
Affectation | text
Cultural Region | text
Personality | text
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
Interface | INT (Netrunner only)
Surgery | TECH (Medtech only)

## Dice
All checks: d10 + Stat + Skill vs Difficulty Value (DV)
DV guide: Everyday 9, Competent 13, Professional 15, Heroic 19, Incredible 24
Critical Success: roll 10 → roll again, add result (keep going on further 10s)
Critical Failure: roll 1 → roll again, subtract result (keep going on further 1s)

Attack roll: d10 + REF + weapon skill vs DV 15 (Ranged) or target's DV (melee)
Defence: Evasion check or just DV 15 base for most attacks
Damage: weapon damage dice (e.g. pistol: 2d6, shotgun: 5d6) – armour SP
Aimed shots: –8 to attack, but bypass armour on head/arms/legs

Luck: spend Luck points (1:1) to add to any roll before or after rolling; refreshes each session
Net check (Netrunning): INT + Interface vs Black ICE or DV of NET architecture node

## Notes
### Armour & Damage
Armour has Stopping Power (SP): subtract from damage received.
Armour ablates: each time it stops damage, roll 1d10 — on 1, SP decreases by 1.
Localised hits: head shots bypass body armour; targeted shots require aimed attack.
Seriously Wounded (at or below half HP): –2 to all actions until stabilised.

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
