import clsx from "clsx"
import React, { SyntheticEvent } from "react"
import { LoadingButton } from "@mui/lab";
import { Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";


interface Props {
  onSubmit: (event: SyntheticEvent<unknown>) => void
  loadingButtonText: string
  isSubmitting: boolean
  title?: string
  className?: string
  buttonClassName?: string
}

export const Form: React.FC<Props> = props => {
  const classes = useStyles()

  return (
    <form onSubmit={props.onSubmit} className={clsx(classes.container, props.className)}>
      {props.title && (
        <Typography variant="h5" className={classes.title}>
          {props.title}
        </Typography>
      )}
      {props.children}
      <LoadingButton
        className={props.buttonClassName}
        loading={props.isSubmitting}
        color="primary"
        onClick={props.onSubmit}
        variant="contained"
        type="submit"
      >
        {props.loadingButtonText}
      </LoadingButton>
    </form>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridGap: theme.spacing(3.5),
    "& .MuiButtonBase-root": {
      fontWeight: "bold",
    },
  },
  title: {
    justifySelf: "center",
    color: theme.palette.primary.dark,
    marginBottom: theme.spacing(2),
  },
}))
