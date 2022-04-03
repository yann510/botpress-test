import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { FileWatchEvent, Path, PathDetailed } from "@stator/models"
import { orderBy } from "lodash"

import { sliceSocketReducerFactory } from "../slice-socket-reducer-factory"
import { SliceState, getInitialSliceState } from "../slice-state"

export interface FileWatcherState extends SliceState {
  inputPaths: Path[]
  watchedPaths: PathDetailed[]
}

export const fileWatcherSlice = createSlice({
  name: "file-watcher",
  initialState: {
    inputPaths: [],
    watchedPaths: [],
    ...getInitialSliceState(),
  },
  reducers: {
    setInputPaths: (state: FileWatcherState, action: PayloadAction<Path[]>) => {
      state.inputPaths = action.payload
    },
  },
  extraReducers: {
    ...sliceSocketReducerFactory<FileWatcherState>((state, fileWatchEventJson) => {
      const fileWatchEvent: FileWatchEvent = JSON.parse(fileWatchEventJson)
      if ("paths" in fileWatchEvent) {
        state.watchedPaths = fileWatchEvent.paths
      } else if (fileWatchEvent.eventName.includes("add")) {
        state.watchedPaths = [...state.watchedPaths, fileWatchEvent.path]
      } else if (fileWatchEvent.eventName.includes("unlink")) {
        state.watchedPaths = state.watchedPaths.filter(path => path.name !== fileWatchEvent.path.name)
      }

      const applyWindowsSupport = (path: PathDetailed) => ({ ...path, name: path.name.replace(/\\/g, "/") })

      state.watchedPaths = orderBy(state.watchedPaths.map(applyWindowsSupport), path => path.name)
    }),
  },
})

export const fileWatcherThunks = {
  setInputPaths: fileWatcherSlice.actions.setInputPaths,
}
