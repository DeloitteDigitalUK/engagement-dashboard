import React, { useState } from 'react';

import {
  Typography,
  Button,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  Avatar,
  Box,
  makeStyles,
} from '@material-ui/core';

import { blueGrey, deepOrange, deepPurple, green, red, teal } from '@material-ui/core/colors';

import { Alert } from '@material-ui/lab';

import { useAPI } from '../../api';

import AuthenticatedViewOnlyLayout from "../../layouts/AuthenticatedViewOnlyLayout";
import Loading from '../../components/Loading';
import updateViews from '../../components/update';
import { UpdateHeader } from '../../components/update/updateHelpers';


const useStyles = makeStyles((theme) => ({
  toolbarControl: {
    minWidth: 120,
    marginRight: theme.spacing(2)
  },
  updateCard: {
    transition: "0.3s",
    maxWidth: "90%",
    margin: "auto",
    boxShadow: "0 0 20px 0 rgba(0,0,0,0.12)"
  },
  cardMedia: {
    paddingTop: "30%",
    position: "relative"
  },
  ribbon: {
    color: "white",
    position: "absolute",
    top: theme.spacing(2),
    left: theme.spacing(2),
    backgroundColor: 'red',
    padding: "2px 8px",
    borderRadius: 2
  },
  projectRibbon: {
    backgroundColor: blueGrey[500],
    color: "white",
    padding: "2px 8px"
  },
  sharedHeaderAndNavButton: {
    margin: "auto",
    position: "relative",
    maxWidth: "90%"
  },
  orange: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
  green: {
    color: theme.palette.getContrastText(green[500]),
    backgroundColor: green[500],
  },
  red: {
    color: theme.palette.getContrastText(red[500]),
    backgroundColor: red[500],
  },
  teal: {
    color: theme.palette.getContrastText(teal[500]),
    backgroundColor: teal[500],
  },
}));

var currentDisplayIndex = 0;

function UpdateCard({ project, update }) {

  const classes = useStyles();

  const views = updateViews[update.type];
  const UpdateView = views? views.ContentView : null;

  return (
    <Card className={classes.updateCard} >
          <CardMedia className={classes.cardMedia} image={process.env.PUBLIC_URL+'/stacked-view-header.jpg'}>
            <div className={classes.ribbon}>
                <Typography color={"inherit"}>{update.getDisplayType()}</Typography>
            </div>

          </CardMedia>

         <CardHeader className={classes.projectRibbon}
            title={project.name}
            subheader={project.description}
            titleTypographyProps={{variant:'h5' }}
            subheaderTypographyProps={{variant:'subtitle2', color: 'textSecondary' }}
          />

          <CardHeader
            avatar={
              <Avatar className={getAvatarClass(classes, update.getInitial())}>
                {update.getInitial()}
              </Avatar>
            }
            title={<UpdateHeader update={update} />}
          />

          <CardContent>
            {UpdateView?
              <UpdateView update={update} /> :
              <Alert severity="error">Update type {update.type} not found for update {update.id}!</Alert>
            }
          </CardContent>
    </Card>
  );
}

function getAvatarClass(classes, initial) {
    var classColor = classes.orange;
    switch (initial) {
        case "I" :
            classColor = classes.orange
            break;
        case "G" :
            classColor = classes.purple
            break;
        case "Rel" :
            classColor = classes.green
            break;
        case "R" :
            classColor = classes.red
            break;
        case "F" :
            classColor = classes.teal
            break;
        default :
            classColor = classes.orange;
    }
    return classColor;
}

function initializeCard(aCard, anUpdates) {
  if (aCard == null && anUpdates != null && anUpdates.length > 0) {
    console.log("Initializing the first card out of updates", anUpdates);
    aCard = anUpdates[0];
    currentDisplayIndex = 1;
    console.log("Card value set to", aCard)
  }
  return aCard;
}

export default function ViewProjectPage({ user, project }) {

  const api = useAPI();
  var [card, setCard] = useState(null);

  const [ updates, loading, error ] = api.useUpdates(
    project,
  );

  const classes = useStyles();

  card = initializeCard(card, updates);

  if (error) {
    console.error(error);
  }
  
  var currentValue;

  return (
    <AuthenticatedViewOnlyLayout user={user} project={project}>

      <Box my={2}>

        {loading && <Loading />}
        {error && <Alert severity="error">{error.message}</Alert>}

        {console.log("Displaying card", card)}

        {card && <UpdateCard key={card} project={project} update={card} />}

        {updates && updates.length === 0 && <>
          <Alert severity="warning">No updates found</Alert>
        </>}

      </Box>

      <Box className={classes.sharedHeaderAndNavButton} >
        <Button variant="outlined" color="secondary"onClick={() =>
                            {
                                console.log(updates);
                                if (updates != null) {
                                    if (typeof updates[currentDisplayIndex+1]) {
                                        currentValue = updates[currentDisplayIndex++];
                                        setCard(currentValue);
                                        console.log("Current card set to ", currentValue);
                                    }
                                }
                            }
                        }>
                        Next
              </Button>
      </Box>

    </AuthenticatedViewOnlyLayout>
  );
}