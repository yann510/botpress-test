import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"

import { addGeneratedCacheKeys } from "./endpoints/generated-cache-keys"
import { errorMiddleware } from "./middlewares/error-middleware"
import { socketMiddleware } from "./middlewares/socket-middleware"
import { statorApi } from "./stator-api"
import { fileWatcherSlice } from "./thunks-slice/file-watcher-thunks-slice"
import { snackbarThunksSlice } from "./thunks-slice/snackbar-thunks-slice"

addGeneratedCacheKeys()

export const rootReducer = combineReducers({
  snackbarReducer: snackbarThunksSlice.reducer,
  fileWatcherReducer: fileWatcherSlice.reducer,
  [statorApi.reducerPath]: statorApi.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(errorMiddleware())
      .concat(socketMiddleware)
      .concat(statorApi.middleware),
})
setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch

export const isSuccess = response => "data" in response
