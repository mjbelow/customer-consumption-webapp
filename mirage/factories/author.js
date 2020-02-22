import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  name: (i) => `Author #${i}`,
  afterCreate(author, server) {
    // create 3-7 books for each author
    server.createList('book', Math.floor(Math.random()*5)+3, { author });
  }
});
