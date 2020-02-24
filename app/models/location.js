import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default Model.extend({
  locationClass: attr('string'),
  address: attr('string'),
  city: attr('string'),
  state: attr('string'),
  postalCode: attr('string'),
  customerLocations: hasMany('customer-location'),
  meterLocations: hasMany('meter-location')
});
