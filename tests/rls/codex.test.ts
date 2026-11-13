import { beforeAll, describe, expect, it } from 'vitest'
import { affected, as, createTestDb, createUser, type Db } from './harness.ts'

let db: Db
let gm: string
let player: string
let outsider: string
let otherGm: string
let world: string
let hidden: string
let revealed: string

const BUCKET = 'entity-images'
const path = (entity: string, file = 'portrait.png') => `${world}/${entity}/${file}`

async function upload(user: string, name: string) {
  return as(db, user, `insert into storage.objects (bucket_id, name) values ($1, $2)`, [BUCKET, name])
}

async function visibleFiles(user: string | null) {
  const rows = await as<{ name: string }>(db, user, `select name from storage.objects order by name`)
  return rows.map((r) => r.name)
}

beforeAll(async () => {
  db = await createTestDb()
  gm = await createUser(db, 'gm@example.com')
  player = await createUser(db, 'player@example.com')
  outsider = await createUser(db, 'outsider@example.com')
  otherGm = await createUser(db, 'othergm@example.com')

  world = (await as<{ id: string }>(db, gm, `insert into worlds (name) values ('Aldermere') returning id`))[0].id
  await as(db, gm, `insert into world_members (world_id, user_id) values ($1, $2)`, [world, player])
  await as(db, otherGm, `insert into worlds (name) values ('Elsewhere')`)

  const make = async (name: string, visibility: string) =>
    (
      await as<{ id: string }>(
        db,
        gm,
        `insert into entities (world_id, type, name, visibility) values ($1, 'npc', $2, $3) returning id`,
        [world, name, visibility],
      )
    )[0].id
  hidden = await make('The Hidden Spymaster', 'gm_only')
  revealed = await make('Innkeeper Bram', 'revealed')

  await upload(gm, path(hidden))
  await upload(gm, path(revealed))
}, 60_000)

describe('page names', () => {
  it('must be unique within a world, ignoring capitals and outer spaces', async () => {
    await expect(
      as(db, gm, `insert into entities (world_id, type, name) values ($1, 'lore', '  innkeeper BRAM ')`, [world]),
    ).rejects.toThrow(/unique/)
  })

  it('may repeat across different worlds', async () => {
    const rows = await as(
      db,
      otherGm,
      `insert into entities (world_id, type, name)
         select id, 'npc', 'Innkeeper Bram' from worlds where owner_id = $1 returning id`,
      [otherGm],
    )
    expect(rows).toHaveLength(1)
  })
})

describe('entity images', () => {
  it('lets the GM see every image in their world', async () => {
    expect(await visibleFiles(gm)).toEqual([path(hidden), path(revealed)].sort())
  })

  it('shows a player only images of revealed pages', async () => {
    expect(await visibleFiles(player)).toEqual([path(revealed)])
  })

  it('shows the image as soon as the page is revealed, and hides it again after', async () => {
    await as(db, gm, `update entities set visibility = 'revealed' where id = $1`, [hidden])
    expect(await visibleFiles(player)).toHaveLength(2)
    await as(db, gm, `update entities set visibility = 'gm_only' where id = $1`, [hidden])
    expect(await visibleFiles(player)).toEqual([path(revealed)])
  })

  it('shows nothing to non-members, other GMs or logged-out visitors', async () => {
    expect(await visibleFiles(outsider)).toEqual([])
    expect(await visibleFiles(otherGm)).toEqual([])
    expect(await visibleFiles(null)).toEqual([])
  })

  it('lets only the GM upload, replace or delete', async () => {
    for (const user of [player, outsider, otherGm]) {
      await expect(upload(user, path(revealed, 'sneaky.png'))).rejects.toThrow(/row-level security/)
      expect(await affected(db, user, `update storage.objects set name = name || 'x'`)).toBe(0)
      expect(await affected(db, user, `delete from storage.objects`)).toBe(0)
    }
    await upload(gm, path(revealed, 'second.png'))
    expect(await affected(db, gm, `delete from storage.objects where name = $1`, [path(revealed, 'second.png')])).toBe(1)
  })

  it('refuses uploads outside a real entity folder or into another bucket', async () => {
    await expect(upload(gm, `${world}/not-an-id/x.png`)).rejects.toThrow(/row-level security/)
    await expect(upload(gm, `x.png`)).rejects.toThrow(/row-level security/)
    await expect(upload(gm, `${world}/${crypto.randomUUID()}/x.png`)).rejects.toThrow(/row-level security/)
    await db.exec(`insert into storage.buckets (id, name) values ('other', 'other')`)
    await expect(
      as(db, gm, `insert into storage.objects (bucket_id, name) values ('other', $1)`, [path(revealed)]),
    ).rejects.toThrow(/row-level security/)
  })
})
