import { Path } from "@stator/models"

import { statorApi as api } from "../stator-api"

const injectedRtkApi = api.injectEndpoints({
  endpoints: build => ({
    watchPaths: build.mutation<string[], { paths: Path[] }>({
      query: body => ({ url: `/api/paths/watch`, method: "POST", body: body }),
    }),
  }),
  overrideExisting: false,
})
export const { useWatchPathsMutation } = injectedRtkApi
