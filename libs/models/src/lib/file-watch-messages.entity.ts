export interface FileWatchEvent {
  eventName: "initial" | "add" | "addDir" | "change" | "unlink" | "unlinkDir"
  path?: string
  paths? : string[]
}
