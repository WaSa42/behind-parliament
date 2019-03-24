import some from 'lodash/some';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

import MongooseModel from "./mongoose";
import { config } from '../../index';
import fetch from "node-fetch";
import iconv from "iconv-lite";

class Item {
  constructor(props) {
    const { author, categories, description, guid, id, link, pubDate, title } = props;

    this.id = id;
    this.guid = guid;
    this.author = author;
    this.title = title;
    this.description = description;
    this.link = link;
    this.pubDate = moment(pubDate).format();
    this.categories = categories;
  }

  static parseCategories(categories = []) {
    return categories.map((category) => {
      let matchedCategory = 'other';
      some(Item.CATEGORIES_MATCHING, (matchings, key) => {
        const match = matchings.includes(category);
        if (match) matchedCategory = key;
        return match;
      });

      return matchedCategory;
    });
  }

  static getShape() {
    return {
      ref: PropTypes.string.isRequired,
      guid: PropTypes.string.isRequired,
      author: PropTypes.oneOf(Item.AUTHORS).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      link: PropTypes.string.isRequired,
      pubDate: PropTypes.string.isRequired,
      categories: PropTypes.arrayOf(PropTypes.oneOf(Item.CATEGORIES)),
    };
  }

  // DATABASE

  static findOne = (obj, args) => {
    return MongooseModel.findOne({ ...args }, (err, item) => err || item);
  };

  static find = (obj, args) => {
    return MongooseModel.find({ ...args }, (err, items) => err || items);
  };

  static save = items => {
    let err = null;
    items.forEach(item => {
      MongooseModel.findOne({ ref: item.ref }, (e, found) => {
        if (e) { err = e; }
        else if (!found) new MongooseModel(item).save();
      });
    });

    return err || items;
  };

  static getPDFDocument = (obj, args) => {
    return args.link && fetch(args.link.replace('html', 'pdf'), { method: 'GET' })
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => iconv.decode(Buffer.from(arrayBuffer), 'iso-8859-1').toString())
      .catch(error => error.message);
  };

  // GETTERS

  getAbsolutePath() {
    return `http${config.ssl ? 's' : ''}://${config.hostname}'/feed/item/${this.id}`;
  }
}

Item.AUTHORS = ['senate', 'assembly', 'constitutionalCouncil', 'other'];
Item.CATEGORIES = ['proposal', 'project', 'constitutional', 'organic', 'program', 'resolution', 'other'];
Item.CATEGORIES_MATCHING = { // TODO: Maybe turning this into regex ?
  proposal: ['proposition de loi'],
  project: ['projet de loi'],
  constitutional: ['proposition de loi constitutionnelle'],
  organic: ['projet de loi organique'],
  program: ['projet de loi de programmation'],
  resolution: ['proposition de résolution'],
};

export default Item;
