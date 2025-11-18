import { Plugin } from "../plugin"
import { Share } from "../share/share"
import { Format } from "../format"
import { LSP } from "../lsp"
import { FileWatcher } from "../file/watcher"
import { File } from "../file"
import { Flag } from "../flag/flag"
import { Config } from "../config/config"

export async function InstanceBootstrap() {
  if (Flag.OPENCODE_EXPERIMENTAL_NO_BOOTSTRAP) return
  await Plugin.init()
  Share.init()
  Format.init()

  const cfg = await Config.get()
  const autoInitLsp = cfg.lspConfig?.autoInit ?? true // default old behavior

  if (autoInitLsp) {
    await LSP.init()
  }

  FileWatcher.init()
  File.init()
}
