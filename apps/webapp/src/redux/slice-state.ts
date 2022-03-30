export interface SliceState {
  status: {
    error?: Error
    socketEstablished?: boolean
    communicationStarted?: boolean
  }
}

export const getInitialSliceState = (): SliceState => {
  return {
    status: {
      error: null,
      socketEstablished: false,
      communicationStarted: false,
    },
  }
}
