import { gql } from 'graphql-request';

export const summary = gql`
  query summary {
    user(login: "rkkautsar") {
      url
      name
      bio
      company
      location
      avatarUrl
      pinnedItems(first: 4) {
        edges {
          node {
            ... on Repository {
              name
              url
              description
              updatedAt
            }
          }
        }
      }
    }
  }
`;
