import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize(serialized) {
    switch(serialized.toLowerCase()) {
      case "g":
        return "Gas";
      case "w":
        return "Water";
      case "e":
        return "Electric";
      default:
        return "Unknown";
    }
  },

  serialize(deserialized) {
    return deserialized;
  }
});
