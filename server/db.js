// Backend router. Picks Postgres if DATABASE_URL is set, JSON file otherwise.
// Both backends are exposed via an async interface — callers should `await`.

import { db as jsonDb, init as initJsonDb } from './db-json.js'
import { db as pgDb,   init as initPgDb }   from './db-postgres.js'

const USE_POSTGRES = !!process.env.DATABASE_URL

export async function initDb() {
  if (USE_POSTGRES) {
    console.log('[db] using Postgres')
    await initPgDb(process.env.DATABASE_URL)
    console.log('[db] Postgres ready (schema applied, seed checked)')
  } else {
    console.log('[db] using JSON file (no DATABASE_URL set)')
    initJsonDb()
  }
}

// Wrap JSON's synchronous methods so the caller-side `await` syntax works
// uniformly for both backends.
function asyncify(target) {
  const out = {}
  for (const key of Object.keys(target)) {
    const fn = target[key]
    if (typeof fn === 'function') {
      out[key] = async (...args) => fn(...args)
    } else {
      out[key] = fn
    }
  }
  return out
}

export const db = USE_POSTGRES ? pgDb : asyncify(jsonDb)
