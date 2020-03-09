import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  host: 'https://localhost:5001',

  pathForType() {
    return 'weatherforecast';
  }
});
