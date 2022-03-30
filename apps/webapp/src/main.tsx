import { ThemeProvider, createTheme } from "@mui/material"
import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"

import { App } from "./app/app"
import { store } from "./redux/store"

const theme = createTheme({
  palette: {
    primary: {
      main: "#3276ea",
    },
    secondary: {
      main: "#1a1e22",
    },
  },
  components: {
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingTop: 24,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: "bold",
        },
      },
    },
  },
})

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
)
