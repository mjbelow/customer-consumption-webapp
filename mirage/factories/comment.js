import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({

  text(i) {
    return `this is comment ${i}`;
  },

  publishedAt(i) {
    return `9/${i}/2020`;
  },

  post:association()

});
