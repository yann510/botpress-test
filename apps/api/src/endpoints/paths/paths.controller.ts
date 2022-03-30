import { Body, Controller, Post } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { Path } from "@stator/models"

import { FileWatcherGateway } from "./file-watcher.gateway"

@ApiTags("paths")
@Controller("paths")
export class PathsController {
  constructor(private fileWatcherGateway: FileWatcherGateway) {}

  @Post("/watch")
  watch(@Body() body: { paths: Path[] }) {
    this.fileWatcherGateway.watch(body.paths.map(path => path.name))
  }
}
