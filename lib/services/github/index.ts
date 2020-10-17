import { GraphQLClient } from "graphql-request";
import { RequestDocument } from "graphql-request/dist/types";
import * as queries from "./github.gql";

const endpoint = "https://api.github.com/graphql";
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
  },
});

export const request = (query: RequestDocument) => client.request(query);

export function requestSummary() {
  return request(queries.summary);
}
