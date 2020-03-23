import DS from 'ember-data';
const { Model, attr } = DS;

export default Model.extend({
  stationId: attr('string'),
  dataTypeId: attr('string'),
  readDate: attr('date'),
  readHour: attr('number'),
  readDateTime: attr('date-time'),
  value: attr('decimal'),
  uom: attr('string'),
  alphaValue: attr('string'),
  qualityCode: attr('string')
});
