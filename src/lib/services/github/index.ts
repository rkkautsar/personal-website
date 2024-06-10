import { GraphQLClient } from 'graphql-request';
import * as queries from './github.gql';

const endpoint = 'https://api.github.com/graphql';
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  },
});

export const request = (query) => client.request(query);

export function requestSummary() {
  return request(queries.summary);
}
