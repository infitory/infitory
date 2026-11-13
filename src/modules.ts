import {
  BookOpen,
  CalendarDays,
  Dices,
  Map as MapIcon,
  Swords,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface AppModule {
  /** URL segment: /w/<world>/<slug> */
  slug: string
  name: string
  icon: LucideIcon
  blurb: string
  /** True once the module is built; otherwise it shows a "coming soon" page. */
  ready?: boolean
  /** Which phase of PROJECT_PLAN.md delivers it. */
  phase: string
  features: string[]
}

export const MODULES: AppModule[] = [
  {
    slug: 'codex',
    name: 'Codex',
    icon: BookOpen,
    blurb: 'A self-linking wiki of your NPCs, factions, places, items, events and lore.',
    phase: 'Phase 1',
    ready: true,
    features: [
      'Pages that link to each other with [[Name]]',
      'Relationship map',
      'Reveal pages to players one by one',
    ],
  },
  {
    slug: 'calendar',
    name: 'Calendar',
    icon: CalendarDays,
    blurb: 'Your own months, weekdays, moons, holidays and seasons.',
    phase: 'Phase 2',
    features: [
      'A current in-world date used everywhere',
      'Events pinned to dates',
      'Timeline view',
    ],
  },
  {
    slug: 'atlas',
    name: 'Atlas',
    icon: MapIcon,
    blurb: 'Your map, with pins, terrain regions and a travel planner.',
    phase: 'Phase 3',
    features: [
      'Pins linked to Codex locations',
      'Travel time by terrain and mode',
      'Random encounters on the road',
    ],
  },
  {
    slug: 'engine',
    name: 'World Engine',
    icon: Swords,
    blurb: 'Factions pursue their goals off-screen while the party is busy.',
    phase: 'Phase 4',
    features: [
      'Advance time by week, month or season',
      'A draft chronicle you approve or reject',
      'Tension dashboards',
    ],
  },
  {
    slug: 'hub',
    name: 'Player Hub',
    icon: Users,
    blurb: 'What your players see: sheets, inventory, quests and discovered lore.',
    phase: 'Phase 5',
    features: [
      'Character sheets with flexible fields',
      'Party inventory and quest log',
      'Live reveals, no refresh needed',
    ],
  },
  {
    slug: 'toolkit',
    name: 'GM Toolkit',
    icon: Dices,
    blurb: 'Initiative tracker, dice roller, generators and session notes.',
    phase: 'Phase 6',
    features: [
      'Dice expressions like 4d6kh3',
      'Editable generator tables',
      'Recap builder for players',
    ],
  },
]
