import { makeStyles, createStyles } from '@material-ui/core';

export const useDiffStyles = makeStyles(theme =>
  createStyles({
    left: {
      backgroundColor: '#ffeef0',
      '&:hover': {
        backgroundColor: '#fdb8c0',
      },
    },
    right: {
      backgroundColor: '#e6ffed',
      '&:hover': {
        backgroundColor: '#acf2bd!important',
      },
    },
  })
);
