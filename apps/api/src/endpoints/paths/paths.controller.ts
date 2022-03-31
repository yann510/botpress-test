import fs from "fs"

import { BadRequestException, Body, Controller, Get, Param, Post } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import { Path } from "@stator/models"

import { FileWatcherGateway } from "./file-watcher.gateway"

@ApiTags("paths")
@Controller("paths")
export class PathsController {
  constructor(private fileWatcherGateway: FileWatcherGateway) {}

  @Post("/read-file")
  async readFile(@Body("filePath") filePath: string) {
    const fileContent = await fs.promises.readFile(filePath, { encoding: "utf-8" })

    return { fileContent }
  }

  @Post("/watch")
  async watch(@Body() body: { paths: Path[] }) {
    for await (const path of body.paths) {
      try {
        await fs.promises.stat(path.name)
      } catch (_) {
        throw new BadRequestException(`The provided path does not exist: ${path.name}`)
      }
    }

    await this.fileWatcherGateway.watch(body.paths.map(path => path.name))
  }
}
