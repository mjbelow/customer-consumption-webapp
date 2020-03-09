import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  normalizeQueryRecordResponse: function(store, type, payload) {
    return {
      data: {
        id: 1,
        type: type.modelName,
        attributes: {
          hourly: payload.hourly.data
        }
      }
    }
  }
});
