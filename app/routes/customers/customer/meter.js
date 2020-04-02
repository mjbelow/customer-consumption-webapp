/*global Chart*/
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({

  model(params) {
    this.set('params',params);

    // current day
    let currentDay = new Date("10/23/2019");
    currentDay.setHours(0,0,0,0);
    
    // next day
    let nextDay = new Date(currentDay);
    nextDay.setDate(nextDay.getDate() + 1);
    
    let monthCount = 3;

    // current month
    let currentMonth = new Date(currentDay);
    currentMonth.setDate(1);
    currentMonth.setMonth(currentMonth.getMonth() - monthCount + 1);
    
    // next month
    let nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + monthCount);
    
    // current month (previous year)
    let currentMonthPrevious = new Date(currentMonth);
    currentMonthPrevious.setFullYear(currentMonthPrevious.getFullYear() - 1);

    
    // next month (previous year)
    let nextMonthPrevious = new Date(currentMonthPrevious);
    nextMonthPrevious.setMonth(nextMonthPrevious.getMonth() + monthCount);

    let dayRange = `ge:${currentDay.toLocaleDateString()},lt:${nextDay.toLocaleDateString()}`;
    let monthRange = `ge:${currentMonth.toLocaleDateString()},lt:${nextMonth.toLocaleDateString()}`;
    let monthRangePrevious = `ge:${currentMonthPrevious.toLocaleDateString()},lt:${nextMonthPrevious.toLocaleDateString()}`;

    let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    let labels = [];

    for(let i = 0; i < monthCount; i++)
    {
      labels.push(months[(currentMonth.getMonth() + i) % 12]);
    }

    this.set('labels',labels)

    return hash({
      meter: this.store.findRecord('meter', params.meterId),
      monthlyMeterIntervals: this.store.query('meterInterval', {
        filter: {
          "meter.id": params.meterId,
          readdatetime: monthRange,
          channelId: 1
        },
        sort: "readdatetime"
      }),
      monthlyMeterIntervalsPrevious: this.store.query('meterInterval', {
        filter: {
          "meter.id": params.meterId,
          readdatetime: monthRangePrevious,
          channelId: 1
        },
        sort: "readdatetime"
      }),
      weather: this.store.query('weather', {
        filter: {
          readdatetime: monthRange,
          dataTypeId: "TEMPERATURE"
        },
        sort: "readdatetime"
      })
    });
  },

  setupController(controller, model) {
    this._super(controller, model);

    let route = this;
    let params = this.get('params');
    let labels = this.get('labels');

    Chart.defaults.scale.gridLines.display = false;

    // aggregating functions
    const arrSum = arr => arr.reduce((a,b) => a + b, 0);
    const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

    // get temperature data
    let temperatureData = [];
    
    // keep track of data to aggregate
    let dataValues = [];
    
    // keep track of date in order to aggregate data
    let prevDate = model.monthlyMeterIntervals.firstObject.get("readDateTime");
    // set prevDate to first day of month
    prevDate.setDate(1);
    // set prevDate to midnight
    prevDate.setHours(0,0,0,0);
    
    // reset data values
    dataValues = [];

    // get meter data
    let meterData = [];
    let meterDataPrevious = [];
    
    model.monthlyMeterIntervals.forEach(data => {

      let nextDate = data.get('readDateTime');
      nextDate.setDate(1);
      nextDate.setHours(0,0,0,0);

      if(prevDate.getTime() == nextDate.getTime() && model.monthlyMeterIntervals.lastObject.get("id") != data.get("id"))
      {
        dataValues.push(data.get('readValue'));
      }
      else
      {
        if(model.monthlyMeterIntervals.lastObject.get("id") == data.get("id"))
        {
          dataValues.push(data.get('readValue'));
        }

        prevDate = nextDate;
        meterData.push(arrSum(dataValues));
        
        dataValues = [];
        dataValues.push(data.get('readValue'));
      }
      
    })

    // reset prevDate to new data set
    prevDate = model.monthlyMeterIntervalsPrevious.firstObject.get("readDateTime");
    prevDate.setDate(1);
    prevDate.setHours(0,0,0,0);
    
    // reset data values
    dataValues = [];
    
    model.monthlyMeterIntervalsPrevious.forEach(data => {

      let nextDate = data.get('readDateTime');
      nextDate.setDate(1);
      nextDate.setHours(0,0,0,0);

      if(prevDate.getTime() == nextDate.getTime() && model.monthlyMeterIntervalsPrevious.lastObject.get("id") != data.get("id"))
      {
        dataValues.push(data.get('readValue'));
      }
      else
      {
        if(model.monthlyMeterIntervalsPrevious.lastObject.get("id") == data.get("id"))
        {
          dataValues.push(data.get('readValue'));
        }

        prevDate = nextDate;
        meterDataPrevious.push(arrSum(dataValues));
        
        dataValues = [];
        dataValues.push(data.get('readValue'));
      }
      
    })

    // prevent data points from going above/below a max/min, but still retain original data
    function trimData(arr, min, max) {
      let i;
      let length = arr[0].length;
      arr[1].length = 0;
      for(i = 0; i < length; i++)
      {
        arr[1][i] = (typeof min !== 'undefined') && (arr[0][i] < min) ? min : (typeof max !== 'undefined') && (arr[0][i] > max) ? max : arr[0][i];
      }
    }

    function getData(min, max, count, arr) {
      arr.length = 0;
      let i;
      for(i = 0; i < count; i++)
      {
        arr.push((Math.random()*(max-min))+min);
      }
      return arr;
    }

    var data = [
      // temperature data
      [temperatureData,[]],
      // meter data
      [meterDataPrevious,[]],
      [meterData,[]],
    ]

    trimData(data[0], 0, 100);
    trimData(data[1]);
    trimData(data[2]);

    
    let chartData = {
      labels: labels,
      datasets: [{
        yAxisID: 'temperature',
        label: 'Temperature (F°)',
        data: data[0][1],
        borderColor: "#404040",
        borderWidth: 1,
        type: 'line',
        fill: false,
        lineTension: 0.5,
        pointBackgroundColor: "#808080",
        pointHoverBorderWidth: 2,
        pointRadius: 5,
        pointHitRadius: 5,
        pointHoverRadius: 5,
        spanGaps: true
      },{
        yAxisID: 'meter',
        label: `${model.meter.serviceType} (${model.meter.channel1RawUom})`,
        data: data[1][1],
        backgroundColor:  'hsla(220,0%,61%,0.2)',
        borderColor: 'hsla(220,0%,61%,1)',
        borderWidth: 1,
        hoverBorderWidth: 4,
        type: 'bar'
      },{
        yAxisID: 'meter',
        label: `${model.meter.serviceType} (${model.meter.channel1RawUom})`,
        data: data[2][1],
        backgroundColor:  'hsla(220,100%,61%,0.2)',
        borderColor: 'hsla(220,100%,61%,1)',
        borderWidth: 1,
        hoverBorderWidth: 4,
        type: 'bar'
      }]
    };

    let chartOptions = {
      plugins: {
        datalabels: {
          align: 'top',
          anchor: 'end',
          formatter: function(value, context) {
            return parseFloat(data[context.datasetIndex][0][context.dataIndex]).toFixed(2);
          },
          display: function(context) {
            // hide the first dataset label (temperature)
            if(context.datasetIndex == 0)
              return false;
            return true;
          },
          backgroundColor: 'rgba(255,255,255,0.75)'
        }
      },
      tooltips: {
        enabled: true,
        mode: 'nearest',
        intersect: true,
        //mode: 'dataset',
        callbacks: {
          label: function(tooltipItem) {
            let uom = tooltipItem.datasetIndex === 0 ? 'F°' : model.meter.channel1RawUom;
            return `${parseFloat(data[tooltipItem.datasetIndex][0][tooltipItem.index]).toFixed(2)} ${uom}`;
          }
        }
      },
      scales: {
        yAxes: [
          {
            id: 'meter',
            position: 'left',
            scaleLabel: {
              display: true,
              labelString: `${model.meter.serviceType} (${model.meter.channel1RawUom})`,
              fontSize: 16
            },
            ticks: {
              beginAtZero: true
            }
          },
          {
            id: 'temperature',
            position: 'right',
            scaleLabel: {
              display: true,
              labelString: 'Temperature (F°)',
              fontSize: 16
            },
            ticks: {
              min: 0,
              max: 100,
            }
          }
        ],
        xAxes: [
          {
            ticks: {
              // callback: xLabels
            }
          }
        ]
      },
      legend: {
        display: true,
        onHover: function(e) {
          e.target.style.cursor = 'pointer';
        }
      },
      hover: {
        onHover: function(e) {
          var point = this.getElementAtEvent(e);
          if (point.length) e.target.style.cursor = 'pointer';
          else e.target.style.cursor = 'default';
        },
        mode: 'point',
        animationDuration: 0
      },
      responsive: true,
      maintainAspectRatio: false,
      onClick: function(e) {
        var activePoints = this.getElementAtEvent(e);
        if(activePoints[0]) {
          var chartData = activePoints[0]['_chart'].config.data;
          var idx = activePoints[0]['_index'];
  
          data[activePoints[0]['_datasetIndex']][0][idx] = Number(data[activePoints[0]['_datasetIndex']][0][idx]) + 1;
          trimData(data[0], 0, 100);
          trimData(data[1]);
          trimData(data[2]);

          this.update();
        }

      }
    }

    controller.set('chartData', chartData);
    controller.set('chartOptions', chartOptions);
  }
});
