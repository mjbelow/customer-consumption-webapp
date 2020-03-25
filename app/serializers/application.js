import DS from 'ember-data';
import { camelize } from '@ember/string';

export default DS.JSONAPISerializer.extend({
  keyForRelationship(key) {
    return camelize(key);
  },
  keyForAttribute(key) {
    return camelize(key);
  }
});
