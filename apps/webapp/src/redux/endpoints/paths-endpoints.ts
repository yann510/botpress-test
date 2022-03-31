import { Path } from "@stator/models"

import { statorApi as api } from "../stator-api"

export const pathApi = api.injectEndpoints({
  endpoints: build => ({
    watchPaths: build.mutation<null, { paths: Path[] }>({
      query: body => ({ url: `/paths/watch`, method: "POST", body }),
    }),
  }),
  overrideExisting: false,
})
export const { useWatchPathsMutation } = pathApi
