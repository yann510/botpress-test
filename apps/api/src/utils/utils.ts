import { ConfigModule, ConfigService } from "@nestjs/config"
import { ConfigFactory } from "@nestjs/config/dist/interfaces"
import { WinstonModule, utilities as nestWinstonModuleUtilities } from "nest-winston"
import winston from "winston"

import { environment } from "../environments/environment"

export const getWinstonConsoleFormat = () =>
  environment.production
    ? winston.format.json()
    : winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike("MyApp", { prettyPrint: true })
      )

export const getRootModuleImports = (configuration: ConfigFactory) => [
  ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
  WinstonModule.forRoot({ transports: [new winston.transports.Console({ format: getWinstonConsoleFormat() })] }),
]
