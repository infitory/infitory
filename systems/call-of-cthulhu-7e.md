# System name
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
- Luck = 3d6 × 5 (rolled separately, not averaged)
- Damage Bonus: based on STR + SIZ total (see table)
- Build: –2 (under 64), –1 (65–84), 0 (85–124), +1 (125–164), +2 (165–204)
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
Accounting | EDU-based | starting: EDU×2%
Anthropology | EDU-based | starting: 1%
Appraise | INT-based | starting: 5%
Archaeology | EDU-based | starting: 1%
Art & Craft (choose) | DEX-based | starting: 5%
Charm | APP-based | starting: 15%
Climb | STR+DEX-based | starting: 20%
Computer Use | EDU-based | starting: 5% (modern)
Credit Rating | varies | starting: by occupation
Cthulhu Mythos | none | starting: 0% (never deliberately raised)
Disguise | APP-based | starting: 5%
Dodge | DEX×2 | starting: DEX×2%
Drive Auto | DEX-based | starting: 20%
Electrical Repair | INT-based | starting: 10%
Fast Talk | APP-based | starting: 5%
Fighting (Brawl) | STR+DEX-based | starting: 25%
Firearms (Handgun) | DEX-based | starting: 20%
Firearms (Rifle/Shotgun) | DEX-based | starting: 25%
First Aid | DEX-based | starting: 30%
History | EDU-based | starting: 5%
Intimidate | STR+CHA-based | starting: 15%
Jump | STR+DEX-based | starting: 20%
Language (Other) | EDU-based | starting: 1%
Language (Own) | EDU-based | starting: EDU×5%
Law | EDU-based | starting: 5%
Library Use | INT-based | starting: 20%
Listen | INT-based | starting: 20%
Locksmith | DEX-based | starting: 1%
Mechanical Repair | DEX-based | starting: 10%
Medicine | EDU-based | starting: 1%
Natural World | INT/EDU-based | starting: 10%
Navigate | INT-based | starting: 10%
Occult | INT-based | starting: 5%
Operate Heavy Machinery | DEX-based | starting: 1%
Persuade | APP-based | starting: 10%
Pilot (choose) | DEX-based | starting: 1%
Psychology | INT-based | starting: 10%
Psychoanalysis | EDU-based | starting: 1%
Ride | DEX-based | starting: 5%
Science (choose) | EDU-based | starting: 1%
Sleight of Hand | DEX-based | starting: 10%
Spot Hidden | INT-based | starting: 25%
Stealth | DEX-based | starting: 20%
Survival | INT-based | starting: 10%
Swim | STR+CON-based | starting: 20%
Throw | DEX-based | starting: 20%
Track | INT-based | starting: 10%

## Dice
All skill checks: roll d100, succeed if result ≤ skill value
Regular success: roll ≤ skill value
Hard success: roll ≤ half skill value
Extreme success: roll ≤ one fifth of skill value
Fumble: roll 96–100 (or 100 if skill ≤ 50)

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
