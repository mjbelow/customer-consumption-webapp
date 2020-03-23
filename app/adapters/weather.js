import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  host: 'https://customer-consumption-api.azurewebsites.net',

  pathForType() {
    return 'weathers';
  }
});
