/*global Chart*/
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({

  model(params) {
    this.set('params',params);

    return hash({
      meter: this.store.findRecord('meter', params.meterId),
      meterIntervals: this.store.query('meterInterval', {
        filter: {
          "meter.id": params.meterId,
          readDate: "2018-09-03"
        }
      }),
      id: params.meterId
    });
  },

  setupController(controller, model) {
    this._super(controller, model);

    let route = this;
    let params = this.get('params');

    Chart.defaults.scale.gridLines.display = false;

    // prevent data points from going above/below a max/min, but still retain original data
    function trimData(arr, min, max) {
      let i;
      arr[1].length = 0;
      for(i = 0; i < 24; i++)
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
      [getData(50,120,24,[]),[]],
      // meter data
      [getData(0,10,24,[]),[]],
    ]

    trimData(data[0], 0, 100);
    trimData(data[1]);

    
    let chartData = {
      labels: [
        '1:00am',  '2:00am',  '3:00am',
        '4:00am',  '5:00am',  '6:00am',
        '7:00am',  '8:00am',  '9:00am',
        '10:00am', '11:00am', '12:00pm',
        '1:00pm',  '2:00pm',  '3:00pm',
        '4:00pm',  '5:00pm',  '6:00pm',
        '7:00pm',  '8:00pm',  '9:00pm',
        '10:00pm', '11:00pm', '12:00am'
      ],
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
              beginAtZero: true,
              max: Math.ceil((Math.max(...chartData.datasets[1].data)+Math.floor(Math.max(...chartData.datasets[1].data)/20) + 1)),
              stepSize: Math.ceil((Math.max(...chartData.datasets[1].data)+Math.floor(Math.max(...chartData.datasets[1].data)/20) + 1)) / 6,
              callback: function(value) {
                return value == 0 ? 0 : value.toFixed(2);
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
          trimData(data[1], .5);
          let max = Math.max(...chartData.datasets[1].data);
          let increment = Math.floor(max/20) + 1;
          this.options.scales.yAxes[0].ticks.max = Math.ceil((max+increment));
          this.options.scales.yAxes[0].ticks.stepSize = this.options.scales.yAxes[0].ticks.max / 6;
          
          model.meterIntervals = route.store.query('meterInterval', {
            filter: {
              "meter.id": params.meterId,
              readDate: "2018-08-03"
            }
          }).then(meterIntervals => {
            meterIntervals.forEach(interval => {
              console.log(interval.readDate)
            })

            return meterIntervals;
          });
          
          this.update();
        }

      }
    }

    controller.set('chartData', chartData);
    controller.set('chartOptions', chartOptions);
  }
});
