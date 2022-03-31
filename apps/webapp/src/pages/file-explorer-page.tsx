import { send } from "@giantmachines/redux-websocket"
import CloseIcon from "@mui/icons-material/Close"
import { Theme, Typography } from "@mui/material"
import { makeStyles, useTheme } from "@mui/styles"
import { Path } from "@stator/models"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useWindowSize } from "react-use"

import { FileExplorerTree } from "../components/display/file-explorer-tree"
import { useWatchPathsMutation } from "../redux/endpoints/paths-endpoints"
import { AppDispatch, RootState } from "../redux/store"
import { FileWatcherState } from "../redux/thunks-slice/file-watcher-thunks-slice"

interface Props {}

export const FileExplorerPage: React.FC<Props> = props => {
  const classes = useStyles()
  const theme = useTheme()
  const fileWatcherState = useSelector<RootState, FileWatcherState>(state => state.fileWatcherReducer)
  const [watchPaths, { isLoading: isLoadingWatchPaths }] = useWatchPathsMutation()
  const [paths, setPaths] = useState<Path[]>([{ name: "/home/yann510/Pictures/" }, { name: "/home/yann510/yann510/rvest" }])
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { height: windowHeight } = useWindowSize()
  const titleBarHeight = 40
  const fileExplorerTreeHeight = windowHeight - titleBarHeight

  useEffect(() => {
    if (fileWatcherState.status.socketEstablished && !fileWatcherState.status.communicationStarted) {
      dispatch(send({ event: "changes" }))
    }
  }, [fileWatcherState.status.communicationStarted, fileWatcherState.status.socketEstablished])

  useEffect(() => {
    const response = watchPaths({ paths })
  }, [])

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
