import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  host: 'http://localhost:5001',
  pathForType() {
    return 'customerLocations';
  }
});
