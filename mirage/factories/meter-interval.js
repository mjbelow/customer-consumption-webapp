import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  readDate(i) {
    return new Date((Math.floor((i+1)/24))*24*60*60*1000+5*60*60*1000);
  },

  readHour(i) {
    return (i%24)+1;
    // return (Math.floor(i/13)%24)+1;
  },

  read30Min() {
    return 0;
    // let data=[0,1,1,1,1,1,1,2,2,2,2,2,2]
    // return data[i%13];
  },

  read15Min() {
    return 0;
    // let data=[0,1,1,1,2,2,2,3,3,3,4,4,4]
    // return data[i%13];
  },

  read5Min() {
    return 0;
    // let data=[0,1,2,3,4,5,6,7,8,9,10,11,12]
    // return data[i%13]
  },

  readDateTime(i) {
    return new Date((i+5+1)*60*60*1000);
  },

  readValue(i) {
    // select meterid, uom, servicetype, avg(readvalue) avg, min(readvalue) min, max(readvalue) max
    // from meterintervals
    // inner join meters on meters.id = meterintervals.meterid
    // group by meterid, uom, servicetype

    // case 0 (G, CCF)  min = 0,      max = 1
    // case 1 (W, CF)   min = 0,      max = 27
    // case 2 (E, KWH)  min = .2170,  max = 10.8930

    // divide by 72 because of how many intervals are created for each meter
    switch(Math.floor(i/72)) {
      case 0:
        return Math.random();
      case 1:
        return Math.random()*30;
      case 2:
        return Math.random()*20;
    }
  }

});
