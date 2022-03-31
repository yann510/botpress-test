import { ConnectedSocket, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets"
import { FileWatchEvent } from "@stator/models"
import chokidar, { FSWatcher } from "chokidar"
import { debounce } from "lodash"
import { Subject, timeout } from "rxjs"
import Socket from "ws"

@WebSocketGateway({ path: "/api/file-watcher" })
export class FileWatcherGateway {
  private fsWatcher: FSWatcher
  private clients: Socket[] = []

  async watch(paths: string[]): Promise<void> {
    await this.resetFileWatcher()

    return new Promise((resolve, reject) => {
      const subject = new Subject<FileWatchEvent>()
      const subscription = this.getSubscription(subject, resolve, reject)

      this.fsWatcher = chokidar.watch(paths, { ignored: ["**/node_modules/*", "**/.*"] }).on("all", (eventName, path) => {
        const event: FileWatchEvent = { eventName, path }

        // When subscription is closed, this means that the initial files have already been streamed as a single message
        // for performance reasons, and we now stream individual updates
        if (subscription.closed) {
          for (const client of this.clients) {
            client.send(JSON.stringify(event))
          }
        } else {
          subject.next(event)
        }
      })
    })
  }

  @SubscribeMessage("changes")
  onSubscribeClosestTradingStocks(@ConnectedSocket() client: Socket) {
    this.clients.push(client)
  }

  private getSubscription(subject: Subject<FileWatchEvent>, resolve: () => void, reject: (reason?: Error) => void) {
    const initialEvents = new Set<FileWatchEvent>()
    const debounceComplete = debounce(() => subject.complete(), 100)
    const subscription = subject.pipe(timeout(10_000)).subscribe({
      next: (event: FileWatchEvent) => {
        if (event.eventName.includes("add")) {
          initialEvents.add(event)
        }
        debounceComplete()
      },
      complete: () => {
        subscription.unsubscribe()
        for (const client of this.clients) {
          client.send(JSON.stringify(this.getInitialEvent(initialEvents)))
        }
        resolve()
      },
      error: error => {
        subscription.unsubscribe()
        reject(error)
      },
    })

    return subscription
  }

  private getInitialEvent(initialEvents: Set<FileWatchEvent>): FileWatchEvent {
    return {
      eventName: "initial",
      paths: Array.from(initialEvents)
        .map(event => event.path)
        .sort(),
    }
  }

  private async resetFileWatcher() {
    if (this.fsWatcher) {
      await this.fsWatcher.close()
      this.fsWatcher = null
    }
  }
}
