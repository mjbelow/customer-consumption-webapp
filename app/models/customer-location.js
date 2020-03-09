import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default Model.extend({
  accountLocationKey: attr('string'),
  serviceStart: attr('date'),
  serviceEnd: attr('date'),
  customer: belongsTo('customer'),
  location: belongsTo('location')
});
