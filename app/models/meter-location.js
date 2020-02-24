import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default Model.extend({
  activeDate: attr('date'),
  inactiveDate: attr('date'),
  location: belongsTo('location'),
  meter: belongsTo('meter')
});
