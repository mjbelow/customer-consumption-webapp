import DS from 'ember-data';
const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
  name: attr('string'),
  books: hasMany('book', {async: true}),
  bestSellers: hasMany(),
  publisher: belongsTo()
});
