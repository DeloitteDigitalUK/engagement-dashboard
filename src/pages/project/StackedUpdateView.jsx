import React, { useState } from 'react';

import {
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  Box,
  makeStyles,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { useAPI } from '../../api';

import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";
import Loading from '../../components/Loading';
import updateViews from '../../components/update';

const useStyles = makeStyles((theme) => ({
  toolbarControl: {
    minWidth: 120,
    marginRight: theme.spacing(2)
  },
  updateCard: {
    transition: "0.3s",
    maxWidth: 500,
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
  sharedHeaderAndNavButton: {
    margin: "auto",
    position: "relative",
    maxWidth: 500
  }
}));

var currentDisplayIndex = 0;

function UpdateCard({ project, update }) {

  const classes = useStyles();

  const views = updateViews[update.type];
  const UpdateView = views? views.FullView : null;

  return (
    <Card className={classes.updateCard} >
        <CardMedia className={classes.cardMedia} image={process.env.PUBLIC_URL+'/stacked-view-header.jpg'}>
            <div className={classes.ribbon}>
                <Typography color={"inherit"}>{update.type}</Typography>
            </div>
        </CardMedia>

        <CardContent>
          {UpdateView?
            <UpdateView update={update} /> :
            <Alert severity="error">Update type {update.type} not found for update {update.id}!</Alert>
          }
        </CardContent>
    </Card>
  );
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
    <AuthenticatedLayout user={user} project={project}>
      <Box className={classes.sharedHeaderAndNavButton} >
        <Typography component="h2" variant="h3" gutterBottom>{project.name}</Typography>
        <Typography paragraph>{project.description}</Typography>
      </Box>

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

    </AuthenticatedLayout>
  );
}