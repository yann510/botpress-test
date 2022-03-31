import { connect, send } from "@giantmachines/redux-websocket/dist"
import { Theme } from "@mui/material"
import { makeStyles } from "@mui/styles"
import clsx from "clsx"
import React, { useEffect } from "react"
import { useDispatch } from "react-redux"
import { Route, Routes } from "react-router-dom"

import { SnackbarListener } from "../components/global/snackbar-listener/snackbar-listener"
import { environment } from "../environments/environment"
import { FileExplorerPage } from "../pages/file-explorer-page"
import { PathsInputPage } from "../pages/paths-input-page"
import { AppDispatch } from "../redux/store"

export const App = () => {
  const classes = useStyles()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(connect(`${environment.apiSocketUrl}/file-watcher`))
  }, [])

  return (
    <>
      <SnackbarListener />
      <Routes>
        <Route path="/file-explorer" element={<FileExplorerPage />} />
        <Route path="*" element={<PathsInputPage />} />
      </Routes>
    </>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    fontFamily: "sans-serif",
    minWidth: 300,
    maxWidth: 600,
    margin: "50px auto",
    display: "grid",
    gridGap: theme.spacing(2),
  },
}))
