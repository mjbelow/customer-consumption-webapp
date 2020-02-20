import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  comments: hasMany('comment', {inverse: 'post', async: true})
});
