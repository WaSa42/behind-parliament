const { gql } = require('apollo-server');

// The GraphQL schema
const typeDefs = gql`
  enum Author {
    senate
    assembly
    constitutionalCouncil
    other
  }
  
  enum Category {
    proposal
    project
    constitutional
    organic
    program
    resolution
    other
  }

  type Item {
    _id: ID!
    guid: String!
    author: Author!
    title: String!
    description: String!
    link: String!
    pubDate: String!
    categories: [Category]!
  }
  
  type Query {
    item(_id: ID!): Item
    items: [Item]
    itemPDF(link: String!): String
  }
`;

export default typeDefs;
