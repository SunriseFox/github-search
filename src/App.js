import React from 'react';

import SearchBar from './components/SearchBar';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import './utils/parser';

import { useEffectiveRef } from './utils/hooks';
import { InputProvider } from './utils/context';

import SearchHistory from './components/SearchHistory';
import { SearchResult } from './components/SearchResult';
import { Container, Hidden, ThemeProvider, Typography, Box } from '@material-ui/core';
import { theme } from './utils/theme';

import './App.css';

function App() {
  const anchorRef = useEffectiveRef();
  return (
    <ThemeProvider theme={theme}>
      <InputProvider>
        <Container>
          <AppBar position="sticky">
            <Toolbar>
              <Hidden xsDown>
                <Box style={{ flex: '0 0 auto' }} mr={3}>
                  <Typography style={{ fontFamily: 'github-search' }} variant="h5">
                    Github Search
                  </Typography>
                </Box>
              </Hidden>
              <SearchBar PaperProps={{ ref: anchorRef }}></SearchBar>
              <SearchHistory anchorRef={anchorRef}></SearchHistory>
            </Toolbar>
          </AppBar>
          <SearchResult />
        </Container>
      </InputProvider>
    </ThemeProvider>
  );
}

export default App;
