import CloseIcon from "@mui/icons-material/Close"
import { Theme, Typography } from "@mui/material"
import { makeStyles } from "@mui/styles"
import React, { useEffect, useState } from "react"
import Highlight from "react-highlight"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useWindowSize } from "react-use"

import { apiClient } from "../clients/api-client"
import { FileExplorerTree } from "../components/display/file-explorer-tree"
import { AppDispatch, RootState } from "../redux/store"
import { FileWatcherState } from "../redux/thunks-slice/file-watcher-thunks-slice"
import { snackbarThunks } from "../redux/thunks-slice/snackbar-thunks-slice"

export const FileExplorerPage = () => {
  const classes = useStyles()
  const fileWatcherState = useSelector<RootState, FileWatcherState>(state => state.fileWatcherReducer)
  const [selectedFileContent, setSelectedFileContent] = useState(null)
  const navigate = useNavigate()
  const { height: windowHeight } = useWindowSize()
  const titleBarHeight = 40
  const fileExplorerTreeHeight = windowHeight - titleBarHeight
  const codeViewerHeight = fileExplorerTreeHeight - 25
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (fileWatcherState.watchedPaths.length === 0) {
      navigateToPathsInputPage()
    }
  }, [fileWatcherState.watchedPaths])

  const navigateToPathsInputPage = () => navigate("/")

  const onFileSelect = async (filePath: string) => {
    try {
      const response = await apiClient.post<{ fileContent: string }>(`/paths/read-file`, { filePath })
      setSelectedFileContent(response.data.fileContent)

    } catch(error) {
      dispatch(snackbarThunks.display({ message: error.response.data.message, severity: "error" }))
    }
  }

  return (
    <>
      <div className={classes.explorerTitleContainer}>
        <Typography variant="body2">File Explorer</Typography>
        <CloseIcon className={classes.closeIcon} onClick={navigateToPathsInputPage} />
      </div>
      <div className={classes.layout}>
        <div className={classes.fileExplorerTreeContainer}>
          <FileExplorerTree paths={fileWatcherState.watchedPaths} height={fileExplorerTreeHeight} onFileSelect={onFileSelect} />
        </div>
        <div style={{ maxHeight: codeViewerHeight }}>
          <Highlight>{selectedFileContent}</Highlight>
        </div>
      </div>
    </>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  layout: {
    display: "grid",
    gridTemplateColumns: "500px 1fr",
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
