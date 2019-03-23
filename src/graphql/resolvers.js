import Item from '../models/Item';

// A map of functions which return data for the schema.
export const resolvers = {
  Query: {
    item: Item.findOne,
    items: Item.find,
  },
};
