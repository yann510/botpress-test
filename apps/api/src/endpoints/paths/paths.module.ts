import { Module } from "@nestjs/common"

import { FileWatcherGateway } from "./file-watcher.gateway"
import FileWatcherService from "./file-watcher.service"
import { PathsController } from "./paths.controller"

@Module({
  imports: [],
  providers: [FileWatcherService, FileWatcherGateway],
  exports: [FileWatcherService, FileWatcherGateway],
  controllers: [PathsController],
})
export class PathsModule {}
