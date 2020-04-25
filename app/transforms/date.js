import DS from 'ember-data';

export default DS.DateTransform.extend({
  deserialize(serialized) {
    let date = this._super(serialized);
    return date.setHours(0,0,0,0);
  }
});
