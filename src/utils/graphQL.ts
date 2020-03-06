import { graphql } from '@octokit/graphql';
import { searchResultDB } from './idb';

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token f70318a372d99d3f7725daee4b2fb54c7856c5c6`,
  },
});

const doDBQuery = async search =>
  await (await searchResultDB)
    .transaction('search', 'readonly')
    .objectStore('search')
    .get(search);

const doGraphQLQuery = async (search, first = 10) =>
  await graphqlWithAuth(
    `
query searchRepos($search: String!, $first: Int = 10) {
search(first: $first, query: $search, type: REPOSITORY) {
  nodes {
    ... on Repository {
      name
      url
      forks {
        totalCount
      }
      watchers {
        totalCount
      }
      stargazers {
        totalCount
      }
      owner {
        avatarUrl(size: 60)
        ... on User {
          name
          login
        }
        ... on Organization {
          name
          login
        }
      }
      id
    }
  }
  edges {
    textMatches {
      highlights {
        beginIndice
      }
    }
  }
}
}  
`,
    { search, first }
  ).then(async data => {
    await (await searchResultDB)
      .transaction('search', 'readwrite')
      .objectStore('search')
      .put(Object.assign(data, { searchText: search }));
    return data;
  });

const parseData = (data?, append?) => {
  if (!data) return [];
  const { search } = data;
  const { nodes } = search;
  return nodes.map(node => {
    const { id, name, url, forks, owner, watchers, stargazers } = node;
    return {
      id,
      name,
      url,
      owner,
      forks: forks.totalCount,
      watchers: watchers.totalCount,
      stargazers: stargazers.totalCount,
    };
  });
};

export async function doDataQuery(_search, first, strategy: { [key: string]: any }) {
  let queries = strategy.compare?.length ? strategy.compare : [_search];
  const result = await Promise.all(
    queries.map(async query => {
      let search = (strategy.sort ? 'sort:' + strategy.sort : '') + ' ' + query;
      return (await doDBQuery(search)) ?? (await doGraphQLQuery(search, first));
    })
  );
  if (!strategy.compare?.length) return parseData(result[0]);
  {
    const merged = [];
    const left: any[] = parseData(result[0]);
    const right: any[] = parseData(result[1]);
    const assertDedupped = (item, target) => {
      const index = merged.findIndex(i => i.id === item.id);
      if (index !== -1) {
        merged.splice(index, 1);
        return item;
      }
      return Object.assign(item, { compare: target });
    };
    while (left.length) {
      const top = left[0];
      const target = right.findIndex(i => i.id === top.id);
      if (target === -1) merged.push(assertDedupped(left.shift(), 'left'));
      else if (target === 0) {
        merged.push(left.shift());
        right.shift();
      } else merged.push(assertDedupped(right.shift(), 'right'));
    }
    if (left.length) return left.map(item => assertDedupped(item, 'left')).concat(merged);
    return merged.concat(right.map(item => assertDedupped(item, 'right')));
  }
}
