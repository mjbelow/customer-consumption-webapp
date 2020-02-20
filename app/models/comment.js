import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default Model.extend({
  text: attr('string'),
  publishedAt: attr('date'),
  post: belongsTo()
});
