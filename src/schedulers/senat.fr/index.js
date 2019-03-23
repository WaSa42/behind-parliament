import schedule from 'node-schedule';
import isArray from 'lodash/isArray';
import iconv  from 'iconv-lite';
import fetch from 'node-fetch';
import xml2js from 'xml2js';

import Item from '../../models/Item';

const parser = new xml2js.Parser();

const prettifyData = (json = { items: [] }) => ({
  ...json,
  items: json.items.map((item) => {
    const guid = (isArray(item.guid) ? item.guid[0] : item.guid) || '';
    const newData = {
      ...item,
      ref: `senate_${guid.replace('http://www.senat.fr/', '')
        .replace('.html', '')
        .replace('/', '_')}`,
      author: 'senate',
      categories: Item.parseCategories(item.category),
    };

    const prettifiedData = {};
    Object.keys(Item.getShape()).forEach((property) => {
      prettifiedData[property] = newData[property];
    });

    return prettifiedData;
  }),
});

const getItems = () => {
  fetch('https://www.senat.fr/rss/textes.rss', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => iconv.decode(Buffer.from(arrayBuffer), 'iso-8859-1').toString())
    .then(xml => {
      if (!xml) return false;

      let json = '';

      parser.parseString(xml, (err, result) => {
        json = result;
      });

      const items = json.rss.channel[0].item;
      const prettifiedData = prettifyData({ ...json, items });

      Item.save(prettifiedData.items);
    })
    .catch(error => console.error(`ERROR: ${error.message}`));

};

// Every day at 2AM
let scheduleRule = new schedule.RecurrenceRule();
scheduleRule.hour = 2;

export default {
  getItems,
  scheduleRule,
}
