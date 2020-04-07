import DS from 'ember-data';

export default DS.DateTransform.extend({
  deserialize(serialized) {
    // return date in UTC format
    serialized = serialized.replace(" ","T");

    return new Date(serialized+"Z");
  }
});
