import { createSlice } from "@reduxjs/toolkit"
import { FileWatchEvent, FileWatchEventInitialResponse } from "@stator/models"

import { sliceSocketReducerFactory } from "../slice-socket-reducer-factory"
import { SliceState, getInitialSliceState } from "../slice-state"

export interface FileWatcherState extends SliceState {
  paths: string[]
}

export const fileWatcherSlice = createSlice({
  name: "file-watcher",
  initialState: {
    paths: [],
    ...getInitialSliceState(),
  },
  reducers: {},
  extraReducers: {
    ...sliceSocketReducerFactory<FileWatcherState>((state, fileWatchEventJson) => {
      const fileWatchEvent: FileWatchEvent | FileWatchEventInitialResponse = JSON.parse(fileWatchEventJson)
      if ("paths" in fileWatchEvent) {
        state.paths = fileWatchEvent.paths
      } else if (fileWatchEvent.eventName.includes("add")) {
        state.paths = [...state.paths, fileWatchEvent.path]
      } else if (fileWatchEvent.eventName.includes("unlink")) {
        state.paths = state.paths.filter(path => path !== fileWatchEvent.path)
      } else {
        console.log(fileWatchEvent)
      }
    }),
  },
})
