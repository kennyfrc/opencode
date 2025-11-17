#!/usr/bin/env bun

import { $ } from "bun"
import { Script } from "@opencode-ai/script"

const notes = [] as string[]

console.log("=== publishing ===\n")

if (!Script.preview) {
  const previous = await fetch("https://registry.npmjs.org/opencode-fork/latest")
    .then((res) => {
      if (!res.ok) throw new Error(res.statusText)
      return res.json()
    })
    .then((data: any) => data.version)

  const log =
    await $`git log v${previous}..HEAD --oneline --format="%h %s" -- packages/opencode packages/sdk packages/plugin`.text()

  const commits = log
    .split("\n")
    .filter((line) => line && !line.match(/^\w+ (ignore:|test:|chore:)/i))
    .join("\n")

  console.log("generating changelog since " + previous)
  
  // Simple manual changelog generation
  for (const line of commits.split("\n")) {
    if (line && !line.match(/^\w+ (ignore:|test:|chore:)/i)) {
      const cleanLine = line.replace(/^\w+\s+/, '').replace(/"/g, '')
      const formattedLine = cleanLine.charAt(0).toUpperCase() + cleanLine.slice(1)
      notes.push(`- ${formattedLine}`)
    }
  }
  console.log(notes)
}

const pkgjsons = await Array.fromAsync(
  new Bun.Glob("**/package.json").scan({
    absolute: true,
  }),
).then((arr) => arr.filter((x) => !x.includes("node_modules") && !x.includes("dist")))

for (const file of pkgjsons) {
  let pkg = await Bun.file(file).text()
  pkg = pkg.replaceAll(/"version": "[^"]+"/g, `"version": "${Script.version}"`)
  console.log("updated:", file)
  await Bun.file(file).write(pkg)
}
await $`bun install`

console.log("\n=== opencode ===\n")
await import(`../packages/opencode/script/publish.ts`)

console.log("\n=== sdk ===\n")
await import(`../packages/sdk/js/script/publish.ts`)

console.log("\n=== plugin ===\n")
await import(`../packages/plugin/script/publish.ts`)

const dir = new URL("..", import.meta.url).pathname
process.chdir(dir)

if (!Script.preview) {
  await $`git commit -am "release: v${Script.version}"`
  await $`git tag v${Script.version}`
  await $`git fetch origin`
  await $`git cherry-pick HEAD..origin/dev`.nothrow()
  await $`git push origin HEAD --tags --no-verify --force-with-lease`
  await $`gh release create v${Script.version} --title "v${Script.version}" --notes ${notes.join("\n") ?? "No notable changes"} ./packages/opencode/dist/*.zip`
}
