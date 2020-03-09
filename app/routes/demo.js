import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({

  model() {
    return hash({
      customers: this.store.findAll('customer', {include: 'customer-locations'}),
      locations: this.store.findAll('location', {include: 'customer-locations,meter-locations'}),
      // meters: this.store.findAll('meter', {include: 'meter-locations'}),
      meters: this.store.findAll('meter', {include: 'meterLocations,meterIntervals'}),
      // meters: this.store.findAll('meter', {include: 'meterLocations,meterIntervals'}).then(function(result) {
      //   return result.slice(0,1)
      // }),
      customerLocations: this.store.findAll('customer-location', {include: 'customer,location'}),
      meterLocations: this.store.findAll('meter-location', {include: 'meter,location'}),
      // meterIntervals: this.store.findAll('meter-interval', {include: 'meter'})
    })
  }

});
