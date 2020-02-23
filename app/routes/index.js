import Route from '@ember/routing/route';

export default Route.extend({
    model() {
        // bestSellers, best-sellers, best-Sellers (all work)
        return this.store.findAll('author', {include: 'books,publisher,best-sellers'})
    }
});
