/**
 * A small invented setting used by "Add sample content". It deliberately
 * mixes revealed and hidden pages, labelled links and [[Name]] mentions so
 * every Codex feature has something to show.
 */
import { textToDoc } from '../logic/richText'
import {
  CURRENT_VERSION,
  FORMAT,
  type ExportEntity,
  type ExportEntityType,
  type ExportLink,
  type WorldExport,
} from '../logic/worldExport'

function page(
  id: string,
  type: ExportEntityType,
  name: string,
  summary: string,
  text: string,
  options: {
    tags?: string[]
    revealed?: boolean
    secret?: string
    fields?: [string, string][]
  } = {},
): ExportEntity {
  const entity: ExportEntity = {
    id,
    type,
    name,
    summary,
    description: textToDoc(text),
    tags: options.tags ?? [],
    visibility: options.revealed ? 'revealed' : 'gm_only',
    data: options.fields
      ? { fields: options.fields.map(([label, value]) => ({ label, value })) }
      : {},
  }
  if (options.secret) entity.secretNotes = textToDoc(options.secret)
  return entity
}

function link(from: string, to: string, label: string, revealed = false): ExportLink {
  return { from, to, label, visibility: revealed ? 'revealed' : 'gm_only' }
}

const entities: ExportEntity[] = [
  // Locations
  page(
    'harrowgate',
    'location',
    'Harrowgate',
    'A walled river town where three trade roads meet.',
    'Harrowgate grew rich on tolls from the Greywater bridge. The [[Tollwrights Guild]] runs the gates and the market; the [[Wardens of the Marches]] keep the walls.\nMost travellers stay at [[The Gilded Heron]].',
    {
      tags: ['town', 'marches'],
      revealed: true,
      fields: [
        ['Population', 'about 4,000'],
        ['Ruler', 'Reeve Odalys Venn'],
      ],
    },
  ),
  page(
    'heron',
    'location',
    'The Gilded Heron',
    'The best inn in Harrowgate, and the best place to hear a rumour.',
    'A three-storey inn by the bridge, kept by [[Bram Oakhollow]]. The common room is neutral ground by long custom.',
    {
      tags: ['inn', 'harrowgate'],
      revealed: true,
      secret:
        'The cellar has a bricked-up door into the old river tunnels. The [[Ash Court]] uses it.',
    },
  ),
  page(
    'mirewood',
    'location',
    'The Mirewood',
    'A drowned forest east of the river. People who go in looking for something tend to find it.',
    'Black water, leaning alders and old causeways that go nowhere. The [[Circle of the Drowned Oak]] holds its rites here.',
    { tags: ['forest', 'dangerous'], revealed: true, fields: [['Danger', '4 of 5']] },
  ),
  page(
    'cairn',
    'location',
    'Cairn Vaul',
    'A ruined hill-fort that predates the kingdom.',
    'Somewhere beneath it lies the vault the [[Ash Court]] has been digging toward. See [[The Sundering]].',
    { tags: ['ruin'], secret: 'The vault holds the second half of [[The Lantern of Vaul]].' },
  ),
  // Factions
  page(
    'guild',
    'faction',
    'Tollwrights Guild',
    'Merchants and bridge-keepers who control trade through Harrowgate.',
    'Rich, cautious and allergic to anything that slows the wagons. Led by [[Guildmistress Serafine Dray]].',
    { tags: ['trade', 'harrowgate'], revealed: true },
  ),
  page(
    'wardens',
    'faction',
    'Wardens of the Marches',
    'An under-funded order of rangers sworn to guard the border roads.',
    'They hold [[Harrowgate]]’s walls and patrol the edge of [[The Mirewood]]. Commanded by [[Captain Idris Marrow]].',
    { tags: ['military', 'marches'], revealed: true },
  ),
  page(
    'ashcourt',
    'faction',
    'Ash Court',
    'A conspiracy of dispossessed nobles who want the old throne back.',
    'They work through debts, forged deeds and patient blackmail. Their agent in town is [[The Quiet Factor]].',
    {
      tags: ['secret', 'nobility'],
      secret: 'They believe the Lantern can undo [[The Sundering]]. It cannot.',
    },
  ),
  page(
    'circle',
    'faction',
    'Circle of the Drowned Oak',
    'Marsh-druids who bargain with whatever lives under the Mirewood.',
    'Neither friendly nor hostile. They trade safe passage for favours.',
    { tags: ['druids', 'mirewood'] },
  ),
  // NPCs
  page(
    'bram',
    'npc',
    'Bram Oakhollow',
    'Innkeeper of the Gilded Heron. Knows everyone, says little.',
    'A broad, patient man who served twenty years with the [[Wardens of the Marches]] before buying the inn.',
    {
      tags: ['innkeeper', 'harrowgate'],
      revealed: true,
      secret:
        'Pays protection to the [[Ash Court]] and hates it. Would help anyone who could end it.',
    },
  ),
  page(
    'serafine',
    'npc',
    'Guildmistress Serafine Dray',
    'Sharp, elegant head of the Tollwrights.',
    'Offers generous contracts to capable outsiders, and remembers every favour.',
    {
      tags: ['merchant', 'harrowgate'],
      revealed: true,
      secret: 'Deep in debt to [[The Quiet Factor]].',
    },
  ),
  page(
    'idris',
    'npc',
    'Captain Idris Marrow',
    'Tired, honest commander of the Harrowgate Wardens.',
    'Has forty rangers to do the work of two hundred. Suspects something is moving in [[The Mirewood]].',
    { tags: ['warden'], revealed: true },
  ),
  page(
    'factor',
    'npc',
    'The Quiet Factor',
    'A soft-spoken moneylender nobody can quite describe afterwards.',
    'The [[Ash Court]]’s hand in [[Harrowgate]]. Buys debts, then calls them in.',
    {
      tags: ['villain', 'secret'],
      secret: 'True name: Lord Emeric Vaul, last heir of [[Cairn Vaul]].',
    },
  ),
  page(
    'nessa',
    'npc',
    'Nessa Reedwalker',
    'A young druid of the Circle who guides travellers through the marsh.',
    'Curious about the town and willing to trade marsh-lore for news.',
    { tags: ['druid', 'guide'] },
  ),
  // Items
  page(
    'lantern',
    'item',
    'The Lantern of Vaul',
    'A cracked bronze lantern that burns without oil.',
    'Half of a pair. Its light shows doors that are no longer there.',
    { tags: ['artifact'], secret: 'Currently hidden in the cellar of [[The Gilded Heron]].' },
  ),
  page(
    'seal',
    'item',
    'Warden’s Seal',
    'A pewter badge that grants passage through any gate in the Marches.',
    'Given by [[Captain Idris Marrow]] to those who have earned the Wardens’ trust.',
    { tags: ['token'], revealed: true },
  ),
  // Events
  page(
    'sundering',
    'event',
    'The Sundering',
    'The night, ninety years ago, when the old royal line ended.',
    'The House of Vaul fell at [[Cairn Vaul]] in a single night. Accounts disagree about why.',
    { tags: ['history'], revealed: true },
  ),
  page(
    'bridgefair',
    'event',
    'The Bridge Fair',
    'Harrowgate’s yearly market festival, when the tolls are lifted for three days.',
    'Hosted by the [[Tollwrights Guild]]. The whole region attends.',
    { tags: ['festival', 'harrowgate'], revealed: true },
  ),
  // Lore
  page(
    'oldroads',
    'lore',
    'The Old Causeways',
    'Raised stone roads through the Mirewood, older than any map.',
    'They lead toward [[Cairn Vaul]], though no one living has followed one to its end.',
    { tags: ['history', 'mirewood'] },
  ),
]

const links: ExportLink[] = [
  link('bram', 'heron', 'owns and runs', true),
  link('heron', 'harrowgate', 'is located in', true),
  link('serafine', 'guild', 'leads', true),
  link('idris', 'wardens', 'commands', true),
  link('guild', 'harrowgate', 'controls trade in', true),
  link('wardens', 'harrowgate', 'garrisons', true),
  link('bram', 'wardens', 'served with', true),
  link('factor', 'ashcourt', 'is the agent of'),
  link('serafine', 'factor', 'owes money to'),
  link('bram', 'ashcourt', 'pays protection to'),
  link('ashcourt', 'cairn', 'is excavating'),
  link('ashcourt', 'lantern', 'is hunting for'),
  link('nessa', 'circle', 'belongs to'),
  link('circle', 'mirewood', 'holds rites in'),
  link('ashcourt', 'guild', 'is infiltrating'),
  link('wardens', 'circle', 'has an uneasy truce with'),
  link('sundering', 'cairn', 'happened at'),
  link('bridgefair', 'harrowgate', 'takes place in', true),
  link('oldroads', 'mirewood', 'cross'),
]

export const SAMPLE_WORLD: WorldExport = {
  format: FORMAT,
  version: CURRENT_VERSION,
  exportedAt: '2026-11-13T00:00:00.000Z',
  world: { name: 'Aldermere', settings: {}, currentDay: 0 },
  entities,
  links,
}
