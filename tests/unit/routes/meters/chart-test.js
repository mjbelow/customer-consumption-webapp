import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | meters/chart', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:meters/chart');
    assert.ok(route);
  });
});
