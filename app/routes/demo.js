import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({

  model() {
    return hash({
      customers: this.store.findAll('customer', {include: 'customerLocations'}),
      locations: this.store.findAll('location', {include: 'customerLocations,meterLocations'}),
      // meters: this.store.findAll('meter', {include: 'meter-locations'}),
      meters: this.store.findAll('meter', {include: 'meterLocations'}),
      // meters: this.store.findAll('meter', {include: 'meterLocations,meterIntervals'}).then(function(result) {
      //   return result.slice(0,1)
      // }),
      customerLocations: this.store.findAll('customerLocation', {include: 'customer,location'}),
      // meterLocations: this.store.findAll('meterLocation', {include: 'meter,location'}),
      // meterIntervals: this.store.findAll('meter-interval', {include: 'meter'})
      weather: this.store.query('weather', {
        filter: {
          // readdate: "2019-01-01",
          readdatetime: ["ge:2019-01-01", "lt:2019-01-02"],
        },
        sort: "readdatetime"
      })
      // weather: this.store.findAll('weather')
    })
  }

});
// https://localhost:5001/weathers?filter[readdatetime]=ge:2019-01-01&filter[readdatetime]=lt:2019-01-02&sort=readdatetime