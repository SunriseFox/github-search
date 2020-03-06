import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Paper,
  IconButton,
  InputBase,
  Divider,
  CircularProgress,
  PaperProps,
  Menu,
  MenuItem,
  Chip,
} from '@material-ui/core';

import GitHubIcon from '@material-ui/icons/GitHub';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';

import { useInputProvider } from '../utils/context';
import { useEffectiveRef } from '../utils/hooks';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      flex: '0 1 auto',
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: 400,
      marginLeft: 'auto',
      background: 'rgba(255, 255, 255, 0.4)',
      transition: 'background 0.2s ease',
      '&:focus-within': {
        background: 'rgba(255, 255, 255, 0.8)',
      },
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    divider: {
      height: 28,
      margin: 4,
    },
  })
);

interface SearchBarProps {
  PaperProps: PaperProps;
}

export default function SearchBar(props: SearchBarProps) {
  const classes = useStyles();
  const { PaperProps } = props;
  const [clearable, setClearable] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useEffectiveRef();
  const input = useInputProvider();
  input.setRef(inputRef);

  const sort = input.useStrategy('sort') || undefined;
  const compare = input.useStrategy('compare') || [];

  useEffect(() => {
    const unsubscribe1 = input.subscribe(['input', 'search'], () => {
      setClearable(Boolean(input.value));
      setLoading(true);
    });
    const unsubscribe2 = input.subscribe(['searchend'], () => setLoading(false));
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [input]);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const sortStrategies = useMemo(
    () => [
      ['Best Match', undefined],
      ['Sort by Most Stars', 'stars'],
      ['Sort by Fewest Stars', 'stars-asc'],
      ['Sort by Most Forks', 'forks'],
      ['Sort by Fewest Forks', 'forks-asc'],
      ['Sort by Updated Date', 'updated'],
    ],
    []
  );

  return (
    <Paper
      elevation={0}
      onSubmit={e => e.preventDefault()}
      component="form"
      className={classes.root}
      {...PaperProps}
    >
      <IconButton size="small" className={classes.iconButton}>
        <GitHubIcon />
      </IconButton>
      <InputBase
        className={classes.input}
        placeholder={compare.length ? '' : 'Search Github...'}
        inputProps={{ 'aria-label': 'search github projects', ref: inputRef }}
        startAdornment={
          compare.length ? (
            <Chip
              variant="outlined"
              label={`Comparing ${compare[0]} with ${compare[1] || 'NOTHING'}`}
            ></Chip>
          ) : null
        }
        endAdornment={
          (clearable || compare.length !== 0) && (
            <IconButton
              onClick={() => {
                input.value = '';
                input.setStrategy({ compare: null });
                input.ref.current.focus();
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )
        }
      />
      <Divider className={classes.divider} orientation="vertical" />
      <IconButton
        onClick={e => setAnchorEl(e.currentTarget)}
        size="small"
        type="submit"
        className={classes.iconButton}
        aria-label={loading ? 'loading' : 'search'}
      >
        {loading ? <CircularProgress size={24} /> : <MenuIcon />}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={() => setAnchorEl(null)}
      >
        {sortStrategies.map(sortStrategy => (
          <MenuItem
            key={sortStrategy[0]}
            selected={sort === sortStrategy[1]}
            onClick={() => input.setStrategy({ sort: sortStrategy[1] })}
          >
            {sortStrategy[0]}
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}
