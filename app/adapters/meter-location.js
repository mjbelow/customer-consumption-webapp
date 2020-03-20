import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  host: 'https://customer-consumption-api.azurewebsites.net',
  pathForType() {
    return 'meterLocations';
  }
});
