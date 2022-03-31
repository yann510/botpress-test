import { PathDetailed } from "./path.entity"

export interface FileWatchEvent {
  eventName: "initial" | "add" | "addDir" | "change" | "unlink" | "unlinkDir"
  path?: PathDetailed
  paths?: PathDetailed[]
}
