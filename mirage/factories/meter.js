import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  serviceType(i) {
    let types=['G','W','E'];
    return types[i%3];
  },
  intervalLength: 60,
  channel1RawUom(i) {
    let uom=['CCF','CF','KWH'];
    return uom[i%3];
  },
  channel1Multiplier: 1,
  afterCreate(meter, server) {
    server.createList('meter-interval',72,{meter, uom: meter.channel1RawUom})
  }

});
