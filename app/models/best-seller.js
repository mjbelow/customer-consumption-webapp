import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default Model.extend({
  title: attr(),
  "best-seller-date": attr('date'),
  author: belongsTo()
});
