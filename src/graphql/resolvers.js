import Item from '../mongoose/item';

// A map of functions which return data for the schema.

export const item = args => {
  return Item.findOne({ ...args }, (err, item) => err || item);
};

export const items = args => {
  return Item.find({ ...args }, (err, items) => err || items);
};

export const saveItems = items => {
  let err = null;
  items.forEach(item => {
    Item.findOne({ ref: item.ref }, (e, found) => {
      if (e) {
        err = e;
        return false;
      }
      if (!found) new Item(item).save();
    });
  });

  return err || items;
};

export const resolvers = {
  Query: {
    item,
    items,
  },
};
