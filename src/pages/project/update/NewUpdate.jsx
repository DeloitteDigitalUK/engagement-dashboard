import React from 'react';

import { useLocation } from 'react-router-dom';
import { Typography } from '@material-ui/core';

// import { useAPI } from '../../../api';

// const knownErrors = {}

export default function UpdateUpdatePage({ user, project }) {

  // const history = useHistory();
  const location = useLocation();
  // const api = useAPI();

  const queryParams = new URLSearchParams(location.search);

  return (
    <Typography component="h2" variant="h3" gutterBottom>Add {queryParams.get('type')}</Typography>
  );

}