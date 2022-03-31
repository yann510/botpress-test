import { send } from "@giantmachines/redux-websocket"
import { Delete } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import { Card, CardContent, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, TextField, Theme } from "@mui/material"
import { makeStyles } from "@mui/styles"
import { Path } from "@stator/models"
import React, { ChangeEvent, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { Form } from "../components/containers/form"
import { useFormValidator } from "../hooks/use-form-validator"
import { useWatchPathsMutation } from "../redux/endpoints/paths-endpoints"
import { AppDispatch, RootState, isSuccess } from "../redux/store"
import { FileWatcherState } from "../redux/thunks-slice/file-watcher-thunks-slice"
import { snackbarThunks } from "../redux/thunks-slice/snackbar-thunks-slice"

export const PathsInputPage = () => {
  const classes = useStyles()
  const [paths, setPaths] = useState<Path[]>([{ name: "/home/yann510/Pictures/" }, { name: "/home/yann510/yann510/rvest" }])
  const [newPath, setNewPath] = useState<Path>(new Path())
  const [isAddingPath, setIsAddingPath] = useState(false)
  const { validateForm, errorsByProperty } = useFormValidator(Path)
  const [watchPaths, { isLoading: isLoadingWatchPaths }] = useWatchPathsMutation()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const fileWatcherState = useSelector<RootState, FileWatcherState>(state => state.fileWatcherReducer)

  useEffect(() => {
    if (fileWatcherState.status.socketEstablished && !fileWatcherState.status.communicationStarted) {
      dispatch(send({ event: "changes" }))
    }
  }, [fileWatcherState.status.communicationStarted, fileWatcherState.status.socketEstablished])

  const onNewPathChange = (event: ChangeEvent<HTMLInputElement>) => setNewPath({ name: event.target.value })

  const onDeletePathClick = pathToDelete => {
    setPaths(paths.filter(path => path !== pathToDelete))
    dispatch(snackbarThunks.display({ message: "Path deleted", severity: "warning" }))
  }

  const onSubmit = async event => {
    try {
      setIsAddingPath(true)

      event.preventDefault()
      const isPathUnique = !paths.some(path => path.name === newPath.name)
      if (!isPathUnique) {
        return dispatch(snackbarThunks.display({ message: "Path already exists", severity: "error" }))
      }

      const isFormValid = await validateForm(newPath)
      if (isFormValid) {
        setPaths([...paths, newPath])
        setNewPath(new Path())
        dispatch(snackbarThunks.display({ message: "Path added", severity: "success" }))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsAddingPath(false)
    }
  }

  const onViewFileExplorerClick = async () => {
    const response = await watchPaths({ paths })
    if (isSuccess(response)) {
      navigate("/file-explorer")
      dispatch(snackbarThunks.display({ message: "Watching paths", severity: "success" }))
    }
  }

  return (
    <div className={classes.page}>
      <Card>
        <CardContent className={classes.container}>
          <Form loadingButtonText="Add path" buttonColor="secondary" onSubmit={onSubmit} isSubmitting={isAddingPath}>
            <TextField
              id="add-path-field"
              label="Path name"
              placeholder="Full path name, e.g: /home/user/projects/git-repo"
              value={newPath.name}
              onChange={onNewPathChange}
              error={!!errorsByProperty["name"]}
              helperText={errorsByProperty["name"]}
            />
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className={classes.cardContent}>
          <List>
            {paths.map(path => (
              <ListItem key={path.name}>
                <ListItemText primary={path.name} />
                <ListItemSecondaryAction className={classes.listItemSecondaryAction}>
                  <IconButton onClick={() => onDeletePathClick(path)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      <LoadingButton
        color="primary"
        variant="contained"
        loading={isLoadingWatchPaths}
        disabled={paths.length === 0}
        onClick={onViewFileExplorerClick}
      >
        View file explorer
      </LoadingButton>
    </div>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  page: {
    minWidth: 300,
    maxWidth: 600,
    margin: "50px auto",
    display: "grid",
    gridGap: theme.spacing(2),
  },
  container: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridGap: theme.spacing(2),
    alignItems: "center",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  cardContent: {
    display: "grid",
  },
  listItemSecondaryAction: {
    display: "grid",
    gridTemplateColumns: "1fr",
  },
}))
