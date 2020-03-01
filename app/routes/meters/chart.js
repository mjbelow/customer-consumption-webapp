/*global Chart*/
import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    return this.store.findRecord('meter', params.id);
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

    var data = [
      // temperature data
      [[94,95,107,112,72,65],[]],
      // meter data
      [[2,1,-4,4,7,3],[]]
    ]

    trimData(data[0], 0, 100);
    trimData(data[1], .5);

    let chartData = {
      labels: [21,22,23,0,1,2],
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
        pointRadius: 4,
        pointHitRadius: 4,
        pointHoverRadius: 8,
        spanGaps: true
      },{
        yAxisID: 'meter',
        label: `${model.serviceType} (${model.channel1RawUom})`,
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
            if(context.datasetIndex == 0 && data[context.datasetIndex][0][context.dataIndex] >= 95)
              return 'bottom';
            return 'top';
          },
          offset: function(context) {
            if(context.datasetIndex == 0 && data[context.datasetIndex][0][context.dataIndex] >= 95)
              return 10;
            return 0;
          },
          anchor: 'end',
          formatter: function(value, context) {
            return data[context.datasetIndex][0][context.dataIndex];
          },
          display: function(context) {
            if(context.datasetIndex == 0)
              return 'auto';
            return 'true';
          }
        }
      },
      tooltips: {
        enabled: true,
        mode: 'single',
        //mode: 'dataset',
        callbacks: {
          label: function(tooltipItem, datasets) {
            let uom = tooltipItem.datasetIndex === 0 ? 'F°' : model.channel1RawUom;
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
              labelString: `${model.serviceType} (${model.channel1RawUom})`,
              fontSize: 16
            },
            ticks: {
              beginAtZero: true,
              max: Math.ceil((Math.max(...chartData.datasets[1].data)+Math.floor(Math.max(...chartData.datasets[1].data)/20) + 1)),
              stepSize: Math.ceil((Math.max(...chartData.datasets[1].data)+Math.floor(Math.max(...chartData.datasets[1].data)/20) + 1)) / 6,
              callback: function(value, index, values) {
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
