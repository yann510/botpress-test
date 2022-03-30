import { Path } from "@stator/models"
import * as supertest from "supertest"
import { Repository } from "typeorm"

import { TestingHelper } from "../../utils/test"
import { PathsModule } from "./paths.module"

describe("Paths", () => {
  let testingHelper: TestingHelper
  let repository: Repository<Path>

  beforeAll(async () => {
    testingHelper = await new TestingHelper().initializeModuleAndApp("paths", [PathsModule])

    repository = testingHelper.module.get("TodoRepository")
  })

  beforeEach(() => testingHelper.reloadFixtures())
  afterAll(() => testingHelper.shutdownServer())

  describe("GET /paths", () => {
    it("should return an array of paths", async () => {
      const { body } = await supertest
        .agent(testingHelper.app.getHttpServer())
        .get("/paths")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)

      expect(body).toMatchObject([
        { id: expect.any(Number), text: "test-name-0" },
        { id: expect.any(Number), text: "test-name-1" },
      ])
    })

    it("should create one todo", async () => {
      const todo = { text: "test-name-0" }

      const { body } = await supertest
        .agent(testingHelper.app.getHttpServer())
        .post("/paths")
        .send(todo)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(201)

      expect(body).toMatchObject({ id: expect.any(Number), text: "test-name-0" })
    })

    it("should update the name of a todo", async () => {
      const { body } = await supertest
        .agent(testingHelper.app.getHttpServer())
        .patch(`/paths/1`)
        .send({ text: "updated-name" })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)

      expect(body).toMatchObject({ id: 1, text: "updated-name" })
    })
  })
})
