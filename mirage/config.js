export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    https://www.ember-cli-mirage.com/docs/route-handlers/shorthands
  */

  this.get('/customers');
  this.get('/customers/:id');
  this.get('/locations');
  this.get('/meters', (schema, request) => {
    
    if(request.queryParams['filter[id]']) {
      let today = new Date(`${request.queryParams['filter[year]']}/${request.queryParams['filter[month]']}/${request.queryParams['filter[day]']}`);
      let tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      let found = false;
      return schema.meters.all().filter(function(meter) {

        if(meter.attrs.id != (request.queryParams['filter[id]']) || found) {
          return false;
        }
        else {
          found = true;
        }

        meter.meterIntervals = meter.meterIntervals.filter(function(meterInterval) {
          return (meterInterval.readDateTime >= today) && (meterInterval.readDateTime < tomorrow);
        })

        return true;
      })
    }

    return schema.meters.all();
  });
  this.get('/meters/:id', (schema, request) => {
    let id = request.params.id;

    return schema.meters.find(id);
  });
  this.get('/customer-locations');
  this.get('/meter-locations');
  this.get('/meter-intervals');

  this.passthrough('https://localhost:5001/**');
  this.passthrough('https://customer-consumption-api.azurewebsites.net/**');

}
