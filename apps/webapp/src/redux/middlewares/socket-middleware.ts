import reduxWebsocket from "@giantmachines/redux-websocket"

export const socketMiddleware = reduxWebsocket({
  reconnectOnClose: true,
  dateSerializer: date => date.toISOString(),
  serializer: payload => JSON.stringify(payload),
})
