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
  async readFile(@Body("filePath") filePath: string) {const fileContent = await fs.promises.readFile(filePath, { encoding: "utf-8" })
    const hasTooManyCharacters = fileContent.length > 10_000
    if (hasTooManyCharacters) {
      throw new BadRequestException("File has over 10,000 characters and won't be displayed for performance reasons")
    }

    return { fileContent }
  }

  @Post("/watch")
  async watch(@Body() body: { paths: Path[] }) {
    for await (const path of body.paths) {
      await this.getPathStats(path)
    }

    await this.fileWatcherGateway.watch(body.paths.map(path => path.name))
  }

  private async getPathStats(path: Path) {
    try {
      return await fs.promises.stat(path.name)
    } catch (_) {
      throw new BadRequestException(`The provided path does not exist: ${path.name}`)
    }
  }
}
