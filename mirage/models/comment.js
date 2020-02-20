import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({
  post: belongsTo('post', {inverse: 'comments', async: true})
});
