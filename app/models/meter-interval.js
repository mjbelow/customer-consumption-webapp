import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default Model.extend({
  channelId: attr('string'),
  readDate: attr('date'),
  readHour: attr('number'),
  read30Min: attr('number'),
  read15Min: attr('number'),
  read5Min: attr('number'),
  readDateTime: attr('date-time'),
  readValue: attr('decimal'),
  uom: attr('string'),
  meter: belongsTo('meter')
});
