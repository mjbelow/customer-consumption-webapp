import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('customer', params.id);
  },

  setupController(controller, model) {
    this._super(controller, model);

    controller.setProperties ({
      meterOptions: [
        {text: '-'}
      ],

      actions: {
        changeMeter: function(change) {
          // alert(change.target.value + " " + change.target.selectedIndex)
          // console.log(change)
          controller.transitionToRoute("customers.customer.meter", change.target.value)
        }
      }
    });
    
    model.get("customerLocations").then(customerLocations => {
      let meterOptions = [];
      customerLocations.forEach((customerLocation,currentCustomerLocation) => {
        customerLocation.get("location").then(location => {
          let locationOption = {group: true, text: location.address, options: []};
          meterOptions.push(locationOption);
          location.get("meterLocations").then(meterLocations => {
            meterLocations.forEach((meterLocation, currentMeterLocation) => {
              if(meterLocation.active)
              {
                meterLocation.get("meter").then(meter => {
                  locationOption.options.push({value: meter.id, text: `${meter.id} - ${meter.serviceType}`})
                  if((currentCustomerLocation == (customerLocations.length - 1)) && (currentMeterLocation == (meterLocations.length - 1)))
                  {
                    controller.set("meterOptions", meterOptions)
                  }
                })
              }
            })
          })
        })
      })
    })

  }
});
