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
    })
  }

});
