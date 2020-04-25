import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store.findRecord('customer', params.id);
  },

  setupController(controller, model) {
    this._super(controller, model);

    controller.setProperties ({
      meterOptions: [],

      yearOptions: [
        {text: 2018},
        {text: 2019},
        {text: 2020}
      ],

      monthOptions: [
        {text: 1},
        {text: 2},
        {text: 3},
        {text: 4},
        {text: 5},
        {text: 6},
        {text: 7},
        {text: 8},
        {text: 9},
        {text: 10},
        {text: 11},
        {text: 12}
      ],

      year: 2019,
      month: 12,
      meter: undefined,

      actions: {
        change: function(type, change) {

          let meter = controller.get("meter");
          let year = controller.get("year");
          let month = controller.get("month");

          if(type=="meter2")
          {

            if(new RegExp("mdc-list-item--disabled").test(change.detail.item.className))
              return;

            meter = change.detail.item.innerText.trim().split(" - ")[0];
            controller.set("meter", meter)
          }

          else if(type == "meter")
          {
            meter = change.target.value;
            controller.set("meter", meter);
          }
          else if(type == "year")
          {
            year = change.target.value;
            controller.set("year", year);
          }
          else
          {
            month = change.target.value;
            controller.set("month", month);
          }
          
          if(meter === undefined || year === undefined || month === undefined)
            return;

          controller.transitionToRoute("customers.customer.meter", meter, year, month);

        }
      }
    });
    
    model.get("customerLocations").then(customerLocations => {
      let meterOptions = [{}];
      customerLocations.forEach((customerLocation,currentCustomerLocation) => {
        customerLocation.get("location").then(location => {
          let locationOption = {group: true, text: location.address, options: []};
          meterOptions.push(locationOption);
          location.get("meterLocations").then(meterLocations => {
            meterLocations.forEach((meterLocation, currentMeterLocation) => {
              let active = meterLocation.active;
              meterLocation.get("meter").then(meter => {
                // if(active && controller.get("meter") === undefined)
                //   controller.set("meter", meter.id)
                locationOption.options.push({value: meter.id, text: `${meter.id} - ${meter.serviceType}`, disabled: !active})
                if((currentCustomerLocation == (customerLocations.length - 1)) && (currentMeterLocation == (meterLocations.length - 1)))
                {
                  controller.set("meterOptions", meterOptions);
                  //controller.transitionToRoute("customers.customer.meter", controller.get("meter"), controller.get("year"), controller.get("month"));
                }
              })
            })
          })
        })
      })
    })

  }
});
