import { ConnectedSocket, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets"
import chokidar, { FSWatcher } from "chokidar"
import Socket from "ws"

@WebSocketGateway({ path: "/api/file-watcher" })
export class FileWatcherGateway {
  private fsWatcher: FSWatcher
  private clients: Socket[] = []

  async watch(paths: string[]) {
    await this.resetFileWatcher()

    this.fsWatcher = chokidar.watch(paths, {ignored:["**/node_modules/*", "**/.*"]}).on("all", (eventName, path) => {
      console.log(eventName, path)
      for (const client of this.clients) {
        client.send(JSON.stringify({ eventName, path }))
      }
    })
  }

  @SubscribeMessage("changes")
  onSubscribeClosestTradingStocks(@ConnectedSocket() client: Socket) {
    this.clients.push(client)
  }

  private async resetFileWatcher() {
    if (this.fsWatcher) {
      await this.fsWatcher.close()
      this.fsWatcher = null
    }
  }
}
