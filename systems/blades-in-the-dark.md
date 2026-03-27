# System name
Blades in the Dark

## Description
Blades in the Dark by John Harper (Evil Hat Productions). A game about a crew of scoundrels in Duskwall — a dark industrial fantasy city haunted by ghosts. Players plan heists, build a criminal empire, and deal with the consequences of their reckless lives. The system is narrative-first: roll a number of d6s, take the single highest result. No hit points — instead: Harm, Stress, and Trauma.

## Attributes
Insight | Mental | number | min:0 | max:4
Prowess | Physical | number | min:0 | max:4
Resolve | Social/Spiritual | number | min:0 | max:4

## Derived stats
- Action Ratings: 12 actions rated 0–4 (dots)
- Stress: tracks how hard you push; max 9; at 10 → Trauma
- Trauma: permanent scars on the character (Haunted, Paranoid, Reckless, etc.); at 4 → retire
- Harm: physical/mental wounds rated 1–3; each level applies a penalty to rolls
- Armour: check to reduce incoming Harm (lost for the session)
- Load: Light 3, Normal 5, Heavy 6 — choose before each score
- Coin: currency; Crew has Vault with max Coin; Tiers reflect power level
- Heat: how much the authorities are looking for the crew; reduces with downtime
- Wanted Level: how urgently law enforcement pursues the crew (0–4)
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
Hunt | Insight | track, observe from a distance, attack at range
Study | Insight | gather info, scrutinize detail, read ancient languages
Survey | Insight | quickly assess a situation, perceive your surroundings
Tinker | Insight | fiddle with devices, create gadgets, disable mechanisms, treat wounds
Finesse | Prowess | employ dextrous manipulation or subtle misdirection
Prowl | Prowess | traverse skillfully or quietly
Skirmish | Prowess | entangle a target in close combat
Wreck | Prowess | unleash destruction, breach barriers, disrupt things by force
Attune | Resolve | open your mind to the Ghost Field, channel electroplasm
Command | Resolve | compel swift obedience with your authority
Consort | Resolve | socialise with connections, gain access to resources
Sway | Resolve | influence someone with subtlety, charm, or guile

## Dice
Build your pool: base = Action Rating dots (0–4 d6s)
Push yourself (spend 2 Stress) OR accept a Devil's Bargain → +1d to pool
Assist (teammate spends 1 Stress) → +1d to pool
At zero dots: roll 2d6, take the lowest

Roll pool, take single highest die:
- 6: Full success — you do it, no cost
- 4–5: Partial success — you do it, but there's a cost (Harm, reduced effect, complication)
- 1–3: Bad outcome — things go badly; GM introduces a complication

Critical success: two or more 6s → exceptional result

Position (how risky the action is — set by GM):
- Controlled: low risk, good effect
- Risky: moderate risk, standard effect (default)
- Desperate: high risk, poor effect (but rolling desperate can give more effect)

Effect (how much impact your action has):
- Limited, Standard, or Great — modified by situation, tools, and Scale

Fortune rolls: no action rating, just relevant dots or flat d6 — used for NPC actions, random events

Resistance rolls: roll Attribute dice pool vs Harm or consequence — reduce or negate result; cost = Stress equal to (6 – highest die)

## Notes
### The Score
A Score = a heist, job, or caper.
Approach: decide approach (Assault, Deception, Stealth, Occult, Social, Transport) — determines starting Position.
Planning phase: pick approach, name one key detail you've scouted/arranged → flashback fills the rest.
Engagement roll: determines opening situation when the score begins.

### Flashbacks
At any point during a score, any player can call a flashback.
The GM sets a cost (0–2 Stress) based on how plausible the flashback is.
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
- Tier: 0–4, reflects power and resources
- Hold: Strong or Weak — reflects stability
- Rep: earns Tier upgrades
- Upgrades: crew-wide advantages (better equipment, safe house, training bonus, etc.)
- Turf: territory the crew controls in Duskwall

### The Ghost Field (Electroplasm & Spirits)
Duskwall is surrounded by a lightning barrier that keeps ghosts contained.
The Void Sea and ghost field saturate the city — ghosts, demons, and spirits are real.
Whispers can Attune to the Ghost Field — commune with spirits, channel energy, bind ghosts.
Electroplasm (leviathan blood) powers the city's lightning towers and the criminal economy.
