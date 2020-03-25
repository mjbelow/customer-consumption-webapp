import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
    name(i) {
        let names = ['Matthew', 'John'];
        return names[i];
    }
});
