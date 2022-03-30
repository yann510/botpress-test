export class FileWatchEvent {
  eventName: "add" | "addDir" | "change" | "unlink" | "unlinkDir"
  path: string
}
