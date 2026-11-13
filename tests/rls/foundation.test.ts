import { beforeAll, describe, expect, it } from 'vitest'
import { affected, as, createTestDb, createUser, type Db } from './harness.ts'

let db: Db
let gm: string
let player: string
let outsider: string
let world: string
let hiddenNpc: string
let revealedNpc: string
let revealedTown: string

async function insertEntity(name: string, type: string, visibility: string) {
  const rows = await as<{ id: string }>(
    db,
    gm,
    `insert into entities (world_id, type, name, visibility) values ($1, $2, $3, $4) returning id`,
    [world, type, name, visibility],
  )
  return rows[0].id
}

beforeAll(async () => {
  db = await createTestDb()
  gm = await createUser(db, 'gm@example.com')
  player = await createUser(db, 'player@example.com')
  outsider = await createUser(db, 'outsider@example.com')

  const worlds = await as<{ id: string }>(
    db,
    gm,
    `insert into worlds (name) values ('Aldermere') returning id`,
  )
  world = worlds[0].id
  await as(
    db,
    gm,
    `insert into world_members (world_id, user_id, role) values ($1, $2, 'player')`,
    [world, player],
  )

  hiddenNpc = await insertEntity('The Hidden Spymaster', 'npc', 'gm_only')
  revealedNpc = await insertEntity('Innkeeper Bram', 'npc', 'revealed')
  revealedTown = await insertEntity('Harrowgate', 'location', 'revealed')

  await as(
    db,
    gm,
    `insert into entity_links (world_id, from_id, to_id, label, visibility) values
       ($1, $2, $3, 'lives in', 'revealed'),
       ($1, $2, $3, 'secretly owns', 'gm_only'),
       ($1, $4, $3, 'watches', 'revealed')`,
    [world, revealedNpc, revealedTown, hiddenNpc],
  )
  await as(
    db,
    gm,
    `insert into entity_secrets (entity_id, world_id, notes) values ($1, $2, '"spy"')`,
    [revealedNpc, world],
  )
}, 60_000)

describe('accounts and worlds', () => {
  it('creates a profile for every new account', async () => {
    const rows = await as<{ display_name: string }>(
      db,
      gm,
      `select display_name from profiles where id = $1`,
      [gm],
    )
    expect(rows).toEqual([{ display_name: 'gm' }])
  })

  it('makes the creator of a world its GM', async () => {
    const rows = await as(
      db,
      gm,
      `select role from world_members where world_id = $1 and user_id = $2`,
      [world, gm],
    )
    expect(rows).toEqual([{ role: 'gm' }])
  })

  it('refuses to create a world owned by someone else', async () => {
    await expect(
      as(db, player, `insert into worlds (name, owner_id) values ('Stolen', $1)`, [gm]),
    ).rejects.toThrow(/row-level security/)
  })

  it('shows a world only to its members', async () => {
    expect(await as(db, gm, `select id from worlds`)).toHaveLength(1)
    expect(await as(db, player, `select id from worlds`)).toHaveLength(1)
    expect(await as(db, outsider, `select id from worlds`)).toHaveLength(0)
  })

  it('lets only the GM rename or delete the world', async () => {
    expect(
      await affected(db, player, `update worlds set name = 'Hacked' where id = $1`, [world]),
    ).toBe(0)
    expect(await affected(db, player, `delete from worlds where id = $1`, [world])).toBe(0)
    expect(
      await affected(db, gm, `update worlds set name = 'Aldermere' where id = $1`, [world]),
    ).toBe(1)
  })

  it('stops a player from promoting themselves or adding members', async () => {
    expect(
      await affected(
        db,
        player,
        `update world_members set role = 'gm' where world_id = $1 and user_id = $2`,
        [world, player],
      ),
    ).toBe(0)
    await expect(
      as(
        db,
        player,
        `insert into world_members (world_id, user_id, role) values ($1, $2, 'player')`,
        [world, outsider],
      ),
    ).rejects.toThrow(/row-level security/)
    await expect(
      as(
        db,
        outsider,
        `insert into world_members (world_id, user_id, role) values ($1, $2, 'gm')`,
        [world, outsider],
      ),
    ).rejects.toThrow(/row-level security/)
  })

  it('keeps the owner as GM of their world', async () => {
    await expect(
      as(db, gm, `delete from world_members where world_id = $1 and user_id = $2`, [world, gm]),
    ).rejects.toThrow(/owner/)
    await expect(
      as(db, gm, `update world_members set role = 'player' where world_id = $1 and user_id = $2`, [
        world,
        gm,
      ]),
    ).rejects.toThrow(/owner/)
  })

  it('shows profiles only to people who share a world', async () => {
    expect(await as(db, player, `select id from profiles order by display_name`)).toHaveLength(2)
    expect(await as(db, outsider, `select id from profiles`)).toEqual([{ id: outsider }])
  })

  it('lets you edit only your own profile', async () => {
    expect(
      await affected(db, player, `update profiles set display_name = 'x' where id = $1`, [gm]),
    ).toBe(0)
    expect(
      await affected(db, player, `update profiles set display_name = 'Pip' where id = $1`, [
        player,
      ]),
    ).toBe(1)
  })
})

describe('codex visibility', () => {
  it('shows the GM everything', async () => {
    expect(await as(db, gm, `select id from entities`)).toHaveLength(3)
    expect(await as(db, gm, `select id from entity_links`)).toHaveLength(3)
    expect(await as(db, gm, `select entity_id from entity_secrets`)).toHaveLength(1)
  })

  it('shows a player only revealed entities', async () => {
    const rows = await as<{ id: string }>(db, player, `select id from entities`)
    expect(rows.map((r) => r.id).sort()).toEqual([revealedNpc, revealedTown].sort())
    expect(await as(db, player, `select id from entities where id = $1`, [hiddenNpc])).toHaveLength(
      0,
    )
  })

  it('shows a player only revealed links between entities they can see', async () => {
    const rows = await as<{ label: string }>(db, player, `select label from entity_links`)
    // 'secretly owns' is gm_only; 'watches' is revealed but starts at a hidden NPC.
    expect(rows).toEqual([{ label: 'lives in' }])
  })

  it('never shows GM secrets to a player, even on a revealed entity', async () => {
    expect(await as(db, player, `select * from entity_secrets`)).toHaveLength(0)
  })

  it('stops a player from changing world content', async () => {
    await expect(
      as(db, player, `insert into entities (world_id, type, name) values ($1, 'npc', 'Fake')`, [
        world,
      ]),
    ).rejects.toThrow(/row-level security/)
    expect(
      await affected(db, player, `update entities set visibility = 'revealed' where id = $1`, [
        hiddenNpc,
      ]),
    ).toBe(0)
    expect(
      await affected(db, player, `update entities set name = 'x' where id = $1`, [revealedNpc]),
    ).toBe(0)
    expect(await affected(db, player, `delete from entities where id = $1`, [revealedNpc])).toBe(0)
    expect(
      await affected(db, player, `delete from entity_links where world_id = $1`, [world]),
    ).toBe(0)
    await expect(
      as(db, player, `insert into entity_links (world_id, from_id, to_id) values ($1, $2, $3)`, [
        world,
        revealedNpc,
        revealedTown,
      ]),
    ).rejects.toThrow(/row-level security/)
  })

  it('shows nothing at all to non-members', async () => {
    for (const table of ['entities', 'entity_links', 'entity_secrets', 'world_members']) {
      expect(await as(db, outsider, `select * from ${table}`)).toHaveLength(0)
    }
  })

  it('blocks logged-out visitors from every table', async () => {
    for (const table of [
      'profiles',
      'worlds',
      'world_members',
      'entities',
      'entity_links',
      'entity_secrets',
    ]) {
      await expect(as(db, null, `select * from ${table}`)).rejects.toThrow(/permission denied/)
    }
  })

  it('refuses links between entities of different worlds', async () => {
    const other = await as<{ id: string }>(
      db,
      gm,
      `insert into worlds (name) values ('Other') returning id`,
    )
    await expect(
      as(db, gm, `insert into entity_links (world_id, from_id, to_id) values ($1, $2, $3)`, [
        other[0].id,
        revealedNpc,
        revealedTown,
      ]),
    ).rejects.toThrow(/foreign key/)
  })

  it("deletes all of a world's data when the owner deletes the world", async () => {
    const w = await as<{ id: string }>(
      db,
      gm,
      `insert into worlds (name) values ('Temp') returning id`,
    )
    await as(db, gm, `insert into entities (world_id, type, name) values ($1, 'lore', 'x')`, [
      w[0].id,
    ])
    expect(await affected(db, gm, `delete from worlds where id = $1`, [w[0].id])).toBe(1)
    const left = await db.query(`select 1 from entities where world_id = $1`, [w[0].id])
    expect(left.rows).toHaveLength(0)
  })

  it("removes an owner's worlds when their account is deleted", async () => {
    const temp = await createUser(db, 'temp@example.com')
    await as(db, temp, `insert into worlds (name) values ('Doomed')`)
    await db.query(`delete from auth.users where id = $1`, [temp])
    const left = await db.query(`select 1 from worlds where owner_id = $1`, [temp])
    expect(left.rows).toHaveLength(0)
  })
})
