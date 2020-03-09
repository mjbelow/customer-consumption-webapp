import DS from 'ember-data';

export default DS.NumberTransform.extend({
  deserialize(serialized) {
    return parseFloat(serialized).toFixed(3);
  }
});
