import React, { useState, useEffect, useCallback } from 'react';
import { fromEvent } from 'rxjs';

import {
  List,
  ListItem,
  Avatar,
  ChipProps,
  makeStyles,
  createStyles,
  Box,
  Typography,
  Grow,
} from '@material-ui/core';
import { doDataQuery } from '../utils/graphQL';

import StarIcon from '@material-ui/icons/Star';
import WatchIcon from '@material-ui/icons/Visibility';
import ForkIcon from '@material-ui/icons/Restaurant';
import { useInputProvider } from '../utils/context';
import { storage } from '../utils/storage';
import { useDiffStyles } from '../utils/styles';

type SearchResultItemType = {
  id: string;
  name: string;
  url: string;
  owner: { avatarUrl: string; name?: string; login: string };
  forks: number;
  watchers: number;
  stargazers: number;
  compare?: 'left' | 'right';
};

const useStyles = makeStyles(theme =>
  createStyles({
    chipLine: {},
    chip: {
      display: 'inline-flex',
      alighItems: 'center',
      margin: theme.spacing(0, 1),
    },
    chipLabel: {
      width: '3em',
      padding: theme.spacing(0, 1),
    },
  })
);

function Chip(props: ChipProps) {
  const { icon, label } = props;
  const classes = useStyles();
  return (
    <div className={classes.chip}>
      {icon}
      <span className={classes.chipLabel}>{label}</span>
    </div>
  );
}

function SearchResultItem(props: { item: SearchResultItemType; style? }) {
  const { item, style } = props;
  const classes = useDiffStyles();
  return (
    <ListItem
      button
      className={
        item.compare === 'left'
          ? classes.left
          : item.compare === 'right'
          ? classes.right
          : undefined
      }
      onClick={() => window.open(item.url, '_blank', 'noopener noreferrer')}
      style={style}
    >
      <Avatar src={item.owner.avatarUrl}>{item.owner.name}</Avatar>
      <Box display="flex" flexDirection="column" justifyContent="flex-between">
        <Box mx={1}>
          <Typography variant="h6" component="span">
            {item.name}
          </Typography>
          <Typography variant="body2" component="span">
            {' '}
            by {item.owner.name || item.owner.login}
          </Typography>
        </Box>
        <Box>
          <Chip icon={<StarIcon />} label={item.stargazers} />
          <Chip icon={<ForkIcon />} label={item.forks} />
          <Chip icon={<WatchIcon />} label={item.watchers} />
        </Box>
      </Box>
    </ListItem>
  );
}

export function SearchResult(props: any) {
  const [result, setResult] = useState([]);
  const input = useInputProvider();

  const doSearch = useCallback(() => {
    const value = input.value.trim();
    if (value) storage.set(value);
    doDataQuery(value, 10, input.getStrategy())
      .then(setResult)
      .finally(() => input.dispatch('searchend'));
  }, [input]);

  useEffect(() => {
    const subscription = fromEvent(input, 'search').subscribe(doSearch);
    subscription.add(fromEvent(input, 'strategy').subscribe(doSearch));
    return () => subscription.unsubscribe();
  }, [doSearch, input]);

  return (
    <List>
      {result.map(item => (
        <Grow style={{ transformOrigin: '0 50% 0' }} key={item.id} appear in>
          <SearchResultItem item={item} />
        </Grow>
      ))}
    </List>
  );
}
