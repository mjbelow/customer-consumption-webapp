import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  host: 'http://localhost:5001',
  pathForType() {
    return 'weathers';
  }
});
