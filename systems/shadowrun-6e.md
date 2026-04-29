# System name
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
- Physical Limit = (STR×2 + Body + Reaction) / 3, rounded up
- Mental Limit = (Logic×2 + Intuition + Willpower) / 3, rounded up
- Social Limit = (Charisma×2 + Willpower + Essence) / 3, rounded up
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
Height | text
Weight | text
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
Threshold: number of Hits needed (usually 1–4; GM sets it)
Glitch: half or more of dice pool shows 1s → Glitch (minor complication)
Critical Glitch: half or more 1s AND zero Hits → Critical Glitch (serious consequence)

Opposed test: attacker rolls pool, defender rolls pool; compare net Hits (attacker Hits – defender Hits)

Edge (Sixth Edition):
- Edge replaces the old limit system
- Gain Edge for smart play, clever tactics, good roleplay (max = Edge attribute)
- Spend Edge: pre-roll bonuses (add dice, reroll, etc.) or post-roll (buy Hit, add Hit to ally, etc.)
- Edge refreshes between scenes

Damage:
- Attack Rating (AR) of weapon vs Defence Rating (DR) of armour
- If AR ≥ DR: attacker gains 1 Edge
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
Contacts have Loyalty (1–6) and Connection (1–6).
Loyalty: how much they like you.
Connection: how useful/influential they are.
Use contacts for: information, gear, safe houses, fake IDs, muscle.
