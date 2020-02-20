import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default Model.extend({
  title: attr('string'),
  body: attr('string'),
  publishedAt: attr('date'),
  comments: hasMany()
});
