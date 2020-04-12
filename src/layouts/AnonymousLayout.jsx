import React from 'react';

import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';

function AnonymousLayout({ children }) {

  return (
    <Container maxWidth="sm">
      <CssBaseline />
      <Box my={4}>
        {children}
      </Box>
    </Container>
  );
}

export default AnonymousLayout;
