/*global Chart*/
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({

  model(params) {
    this.set('year', parseInt(params.year, 10));
    this.set('month', parseInt(params.month, 10));
    this.set('day', parseInt(params.day, 10));
    this.set('hour', parseInt(params.hour, 10));

    // coordinates for Knoxville
    let latitude = '35.9606';
    let longitude = '-83.9207'
    
    return hash({
      meter: this.store.findRecord('meter', params.id),
      weather: this.store.queryRecord('weather', {latitude: latitude, longitude: longitude, year: this.get('year'), month: this.get('month'), day: this.get('day'), hour: this.get('hour')})
    });
  },

  setupController(controller, model) {
    this._super(controller, model);

    Chart.defaults.scale.gridLines.display = false;

    // set x labels based on raw data
    function xLabels(value) {
      let meridiem = "am";
      let hour = (value % 12) == 0 ? 12 : (value % 12);

      if(value > 11) {
        meridiem = "pm";
      }

      return `${hour}:00${meridiem}`;
    }

    // prevent data points from going above/below a max/min, but still retain original data
    function trimData(arr, min, max) {
      let i;
      let length = arr[0].length;
      for(i = 0; i < length; i++)
      {
        arr[1][i] = (typeof min !== 'undefined') && (arr[0][i] < min) ? min : (typeof max !== 'undefined') && (arr[0][i] > max) ? max : arr[0][i];
      }
    }

    // generate hours for x axes
    function getHours(hour) {
      let arr = [];
      let i;
      for(i = 0; i < 6; i++)
      {
        arr.push((hour+i)%24);
      }
      return arr;
    }

    function getTemperature(hour) {
      let arr = [];
      let i;
      for(i = 0; i < 6; i++)
      {
        arr.push(model.weather.hourly[(hour+i)%24].temperature);
      }
      return arr;
    }

    var data = [
      // temperature data
      [getTemperature(this.get('hour')),[]],
      // meter data
      [[2,1,-4,4,7,3],[]]
    ]

    trimData(data[0], 0, 100);
    trimData(data[1], .5);

    let chartData = {
      labels: getHours(this.get('hour')),
      datasets: [{
        yAxisID: 'temperature',
        label: 'Temperature (F°)',
        data: data[0][1],
        borderColor: "#404040",
        borderWidth: 1,
        type: 'line',
        fill: false,
        lineTension: 0.5,
        borderDash: [10],
        borderDashOffset: 0,
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
          align: function(context) {
            // move label to bottom when temperature data point is near the top
            if(context.datasetIndex == 0 && data[context.datasetIndex][0][context.dataIndex] >= 95)
            return 'bottom';
            return 'top';
          },
          offset: function(context) {
            // increase offset of label when temperature data point is near the top
            if(context.datasetIndex == 0 && data[context.datasetIndex][0][context.dataIndex] >= 95)
              return 10;
            return 0;
          },
          anchor: 'end',
          formatter: function(value, context) {
            return data[context.datasetIndex][0][context.dataIndex];
          },
          display: function(context) {
            // this will hide the first dataset label if other dataset label overlaps
            if(context.datasetIndex == 0)
              return 'auto';
            return 'true';
          }
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
            return `${data[tooltipItem.datasetIndex][0][tooltipItem.index]} ${uom}`;
          },
          title: function(tooltipItems) {
            return xLabels(tooltipItems[0].xLabel);
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
              beginAtZero: true,
              max: Math.ceil((Math.max(...chartData.datasets[1].data)+Math.floor(Math.max(...chartData.datasets[1].data)/20) + 1)),
              stepSize: Math.ceil((Math.max(...chartData.datasets[1].data)+Math.floor(Math.max(...chartData.datasets[1].data)/20) + 1)) / 6,
              callback: function(value) {
                return Math.floor(value);
              }
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
              callback: xLabels
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
  
          data[activePoints[0]['_datasetIndex']][0][idx] = data[activePoints[0]['_datasetIndex']][0][idx] + 1;
          trimData(data[0], 0, 100);
          trimData(data[1], .5);
          let max = Math.max(...chartData.datasets[1].data);
          let increment = Math.floor(max/20) + 1;
          this.options.scales.yAxes[0].ticks.max = Math.ceil((max+increment));
          this.options.scales.yAxes[0].ticks.stepSize = this.options.scales.yAxes[0].ticks.max / 6;

          this.update();
        }

      }
    }

    controller.set('chartData', chartData);
    controller.set('chartOptions', chartOptions);

  }

});
