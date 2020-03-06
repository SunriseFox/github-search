import React, { useState, useEffect, useMemo } from 'react';

import {
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  IconButton,
} from '@material-ui/core';

import HistoryIcon from '@material-ui/icons/History';
import CloseIcon from '@material-ui/icons/Close';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';

import { useSubscription } from 'use-subscription';

import { stopItNow } from '../utils/event';
import { useInputProvider } from '../utils/context';
import { storage } from '../utils/storage';
import { useDiffStyles } from '../utils/styles';

interface SearchHistoryItemProps {
  value: string;
  onClick?(): void;
  onCompare?(): void;
  onDelete?(): void;
  tabIndex: number;
  selected?: 'left' | 'right';
}

function SearchHistoryItem(props: SearchHistoryItemProps) {
  const { value, onClick, onCompare, onDelete, tabIndex, selected } = props;
  const classes = useDiffStyles();
  return (
    <MenuItem className={classes[selected]} tabIndex={tabIndex} onClick={onClick}>
      <ListItemIcon>
        <HistoryIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={value} />
      <IconButton size="small" onClick={e => stopItNow(e, onCompare)}>
        <CompareArrowsIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={e => stopItNow(e, onDelete)}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </MenuItem>
  );
}

interface SearchHistoryProps {
  anchorRef?: React.MutableRefObject<HTMLElement>;
}

export default function SearchHistory(props: SearchHistoryProps) {
  const { anchorRef } = props;
  const anchorEl = anchorRef.current;

  const input = useInputProvider();

  const [open, setOpen] = useState<boolean>(false);

  const historySubscription = useMemo(
    () => ({
      getCurrentValue: () => storage.get(input.value).slice(0, 10),
      subscribe: callback => storage.subscribe(callback),
    }),
    [input.value]
  );
  const history = useSubscription(historySubscription);

  const compare = input.useStrategy('compare') || [];

  const [width, setWidth] = useState(null);

  useEffect(() => {
    if (!anchorEl) return;
    setWidth(anchorEl.clientWidth);
  }, [anchorEl]);

  useEffect(() => {
    const u1 = input.subscribe(['focus'], () => {
      setOpen(true);
    });
    const u2 = input.subscribe(['search'], () => {
      setOpen(false);
    });
    return () => {
      u1();
      u2();
    };
  }, [input]);

  const onCompare = item => {
    if (input.value !== '' && input.value !== item) {
      input.setStrategy({ compare: [input.value, item] });
      input.value = '';
      return;
    }
    if (compare.includes(item)) input.setStrategy({ compare: compare.filter(i => i !== item) });
    else if (compare.length < 2) input.setStrategy({ compare: [...compare, item] });
  };

  return (
    <Popper style={{ width }} open={open} anchorEl={anchorEl} transition>
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
        >
          <Paper>
            <ClickAwayListener
              onClickAway={e => (e.target as any).tagName !== 'INPUT' && setOpen(false)}
            >
              <MenuList autoFocusItem={false}>
                {history.map((item, index) => (
                  <SearchHistoryItem
                    selected={
                      compare[0] === item ? 'left' : compare[1] === item ? 'right' : undefined
                    }
                    onCompare={() => onCompare(item)}
                    onClick={() => (input.value = item)}
                    onDelete={() => storage.delete(item)}
                    tabIndex={index}
                    key={index}
                    value={item}
                  />
                ))}
                {Boolean(history.length) ?? (
                  <Box py={1}>
                    <Divider />
                  </Box>
                )}
                <MenuItem
                  onClick={() => {
                    storage.clear();
                  }}
                >
                  <Typography>
                    {history.length ? 'Clear all history...' : 'No such history.'}
                  </Typography>
                </MenuItem>
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
}
