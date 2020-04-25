import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('demo');
  this.route('meters', function() {
    this.route('chart', {path: '/:id/:year/:month/:day/:hour'});
  });
  this.route('customers', function() {
    this.route('customer', {path: '/:id'}, function() {
      this.route('meter', {path: '/:meterId/:year/:month'});
    });
  });
});

export default Router;
