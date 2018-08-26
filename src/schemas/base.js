module.exports = () => [base];

const base = `
scalar GraphQLDate
scalar GraphQLTime
scalar GraphQLDateTime

enum EntityType {
  customer
  vendor
}

enum ActionType {
  estimated
  real
}

type Query

type Mutation 
`;
