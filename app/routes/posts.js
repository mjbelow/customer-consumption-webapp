import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return this.store.findAll('post');
    return this.store.findAll('post', {include: 'comments'});
  }
});