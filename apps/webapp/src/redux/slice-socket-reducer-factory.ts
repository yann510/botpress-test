import { WEBSOCKET_CLOSED, WEBSOCKET_ERROR, WEBSOCKET_MESSAGE, WEBSOCKET_OPEN, WEBSOCKET_SEND } from "@giantmachines/redux-websocket"
import { PayloadAction } from "@reduxjs/toolkit"
import {SliceState} from "./slice-state";

export type PayloadEntityAction = PayloadAction<{ message: string }, string>
export type PayloadErrorAction = PayloadAction<Error, string>

const addPrefix = (suffix: string) => `REDUX_WEBSOCKET::${suffix}`

export const sliceSocketReducerFactory = <TSliceState extends SliceState>(
  messageCallback: (state: TSliceState, message: string) => void
) => {
  return {
    [addPrefix(WEBSOCKET_OPEN)]: (state: TSliceState) => {
      state.status.socketEstablished = true
    },
    [addPrefix(WEBSOCKET_SEND)]: (state: TSliceState) => {
      state.status.communicationStarted = true
    },
    [addPrefix(WEBSOCKET_MESSAGE)]: (state: TSliceState, action: PayloadEntityAction) => {
      state.status.error = null
      messageCallback(state, action.payload.message)
    },
    [addPrefix(WEBSOCKET_ERROR)]: (state: TSliceState, action: PayloadErrorAction) => {
      state.status.error = action.payload
    },
    [addPrefix(WEBSOCKET_CLOSED)]: (state: TSliceState) => {
      state.status.socketEstablished = false
      state.status.communicationStarted = false
    },
  }
}
