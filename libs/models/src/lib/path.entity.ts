import { MaxLength, MinLength } from "class-validator"

export class Path {
  // I've decided not to add a regex validation as path regex is pretty complex if you support multiple OS
  @MinLength(1, { always: true })
  @MaxLength(4096, { always: true })
  name: string

  constructor() {
    this.name = ""
  }
}

export class PathDetailed extends Path {
  type: "directory" | "file"
}
