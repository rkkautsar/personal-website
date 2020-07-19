import { GraphQLClient } from "graphql-request";
import useSWR from "swr";

const endpoint = "https://api.github.com/graphql";
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  },
});

export const request = (...params) => client.request(...params);

export function useGithubSWR(query) {
  return useSWR(query, (...params) => client.request(...params));
}
