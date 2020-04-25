import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;
import { equal, gte, lt } from '@ember/object/computed';

export default Model.extend({
  activeDate: attr('date'),
  inactiveDate: attr('date'),
  location: belongsTo('location'),
  meter: belongsTo('meter'),
  active: equal("inactiveDate", new Date("12/31/9999").getTime()),
  inactive: lt("inactiveDate", new Date().setHours(0,0,0,0))
});
