import { Module } from "@nestjs/common"

import { FileWatcherGateway } from "./file-watcher.gateway"
import { PathsController } from "./paths.controller"

@Module({
  imports: [],
  providers: [FileWatcherGateway],
  exports: [FileWatcherGateway],
  controllers: [PathsController],
})
export class PathsModule {}
