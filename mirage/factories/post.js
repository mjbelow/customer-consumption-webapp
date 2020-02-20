import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title(i) {
    return `sentence ${i}`;
  },

  body(i) {
    return `paragraph ${i}`;
  },

  publishedAt(i) {
    return `8/${i}/2020`;
  }
});
