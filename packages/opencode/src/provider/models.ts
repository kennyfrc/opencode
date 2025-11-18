import { Global } from "../global"
import { Log } from "../util/log"
import path from "path"
import z from "zod"
import { data } from "./models-macro" with { type: "macro" }
import { Installation } from "../installation"

export namespace ModelsDev {
  const log = Log.create({ service: "models.dev" })
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
  const CACHE_FILE = path.join(Global.Path.cache, "models.json")

  async function getCacheAge(): Promise<number | undefined> {
    const file = Bun.file(CACHE_FILE)
    const exists = await file.exists()
    if (!exists) return undefined

    const stat = await file.stat().catch(() => undefined)
    if (!stat) return undefined

    // mtimeMs in milliseconds; if not available, fall back to undefined.
    return "mtimeMs" in stat ? (stat as any).mtimeMs as number : undefined
  }

  function isCacheFresh(ageMs: number | undefined): boolean {
    if (ageMs === undefined) return false
    const now = Date.now()
    return now - ageMs <= CACHE_TTL_MS
  }

  export const Model = z
    .object({
      id: z.string(),
      name: z.string(),
      release_date: z.string(),
      attachment: z.boolean(),
      reasoning: z.boolean(),
      temperature: z.boolean(),
      tool_call: z.boolean(),
      cost: z.object({
        input: z.number(),
        output: z.number(),
        cache_read: z.number().optional(),
        cache_write: z.number().optional(),
      }),
      limit: z.object({
        context: z.number(),
        output: z.number(),
      }),
      modalities: z
        .object({
          input: z.array(z.enum(["text", "audio", "image", "video", "pdf"])),
          output: z.array(z.enum(["text", "audio", "image", "video", "pdf"])),
        })
        .optional(),
      experimental: z.boolean().optional(),
      status: z.enum(["alpha", "beta", "deprecated"]).optional(),
      options: z.record(z.string(), z.any()),
      headers: z.record(z.string(), z.string()).optional(),
      provider: z.object({ npm: z.string() }).optional(),
    })
    .meta({
      ref: "Model",
    })
  export type Model = z.infer<typeof Model>

  export const Provider = z
    .object({
      api: z.string().optional(),
      name: z.string(),
      env: z.array(z.string()),
      id: z.string(),
      npm: z.string().optional(),
      models: z.record(z.string(), Model),
    })
    .meta({
      ref: "Provider",
    })

  export type Provider = z.infer<typeof Provider>

  export async function refresh(): Promise<boolean> {
    const file = Bun.file(CACHE_FILE)
    log.info("refreshing", { file })

    const result = await fetch("https://models.dev/api.json", {
      headers: {
        "User-Agent": Installation.USER_AGENT,
      },
      signal: AbortSignal.timeout(10 * 1000),
    }).catch((e) => {
      log.error("Failed to fetch models.dev", { error: e })
      return undefined
    })

    if (!result || !result.ok) return false

    // If write fails, log but treat as failure
    try {
      await Bun.write(file, await result.text())
      return true
    } catch (e) {
      log.error("Failed to write models.dev cache", { error: e })
      return false
    }
  }

  async function tryRefreshAndRead(): Promise<Record<string, Provider> | undefined> {
    const ok = await refresh()
    if (!ok) return undefined

    const file = Bun.file(CACHE_FILE)
    const result = await file.json().catch(() => undefined)
    return result as Record<string, Provider> | undefined
  }

  export async function get() {
    const file = Bun.file(CACHE_FILE)

    // 1. Try cache
    const age = await getCacheAge()
    let cached: Record<string, Provider> | undefined

    if (age !== undefined) {
      cached = await file.json().catch(() => undefined)
      if (cached && isCacheFresh(age)) {
        // Cache is fresh enough; return immediately
        return cached
      }
    }

    // 2. Cache is missing or stale – try to refresh
    const refreshed = await tryRefreshAndRead()
    if (refreshed) return refreshed

    // 3. Refresh failed – still use stale cache if we had any
    if (cached) return cached

    // 4. Last resort – macro data() (likely embedded at build time)
    const json = await data()
    return JSON.parse(json) as Record<string, Provider>
  }
}

// Refresh every 24 hours - matches our cache TTL strategy
setInterval(() => ModelsDev.refresh(), 24 * 60 * 60 * 1000).unref()
