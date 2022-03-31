import CloseIcon from "@mui/icons-material/Close"
import { Theme, Typography } from "@mui/material"
import { makeStyles } from "@mui/styles"
import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useWindowSize } from "react-use"

import { FileExplorerTree } from "../components/display/file-explorer-tree"
import { RootState } from "../redux/store"
import { FileWatcherState } from "../redux/thunks-slice/file-watcher-thunks-slice"

export const FileExplorerPage = () => {
  const classes = useStyles()
  const fileWatcherState = useSelector<RootState, FileWatcherState>(state => state.fileWatcherReducer)
  const navigate = useNavigate()
  const { height: windowHeight } = useWindowSize()
  const titleBarHeight = 40
  const fileExplorerTreeHeight = windowHeight - titleBarHeight

  useEffect(() => {
    if (fileWatcherState.paths.length === 0) {
      navigateToPathsInputPage()
    }
  }, [fileWatcherState.paths])

  const navigateToPathsInputPage = () => navigate("/")

  return (
    <>
      <div className={classes.explorerTitleContainer}>
        <Typography variant="body2">File Explorer</Typography>
        <CloseIcon className={classes.closeIcon} onClick={navigateToPathsInputPage} />
      </div>
      <div className={classes.layout}>
        <div className={classes.fileExplorerTreeContainer}>
          <FileExplorerTree paths={fileWatcherState.paths} height={fileExplorerTreeHeight} />
        </div>
      </div>
    </>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  layout: {
    display: "grid",
    gridTemplateColumns: "600px 1fr",
    height: "100%",
  },
  fileExplorerTreeContainer: {
    display: "grid",
  },
  explorerTitleContainer: {
    backgroundColor: "#252526",
    color: "#acacad",
    padding: 8,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  closeIcon: {
    marginRight: theme.spacing(2),
    cursor: "pointer",
    "&:hover": {
      color: "#fff",
    },
  },
}))
