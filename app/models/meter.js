import DS from 'ember-data';
const { Model, attr, hasMany } = DS;

export default Model.extend({
  meterType: attr('string'),
  serviceType: attr('string'),
  region: attr('string'),
  intervalLength: attr('number'),
  channel1RawUom: attr('string'),
  channel2RawUom: attr('string'),
  channel3RawUom: attr('string'),
  channel4RawUom: attr('string'),
  channel5RawUom: attr('string'),
  channel6RawUom: attr('string'),
  channel7RawUom: attr('string'),
  channel8RawUom: attr('string'),
  channel1Multiplier: attr('string'),
  channel2Multiplier: attr('string'),
  channel3Multiplier: attr('string'),
  channel4Multiplier: attr('string'),
  channel5Multiplier: attr('string'),
  channel6Multiplier: attr('string'),
  channel7Multiplier: attr('string'),
  channel8Multiplier: attr('string'),
  channel1FinalUom: attr('string'),
  channel2FinalUom: attr('string'),
  channel3FinalUom: attr('string'),
  channel4FinalUom: attr('string'),
  channel5FinalUom: attr('string'),
  channel6FinalUom: attr('string'),
  channel7FinalUom: attr('string'),
  channel8FinalUom: attr('string'),
  meterCycle: attr('string'),
  meterLocations: hasMany('meter-location'),
  meterIntervals: hasMany('meter-interval')
});
