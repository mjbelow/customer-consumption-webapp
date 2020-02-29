import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    return this.store.findRecord('meter', params.id);
  },

  setupController(controller, model) {
    this._super(controller, model);

    Chart.defaults.scale.gridLines.display = false;

    let chartData = {
      labels: ["12:00am","1:00am","2:00am","3:00am","4:00am","5:00am"],
      datasets: [{
        yAxisID: 'temperature',
        label: 'Temperature',
        data: [32,45,78,65,50,40],
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
        label: model.serviceType,
        data: [2,1,0,4,7,3],
        backgroundColor:  'hsla(220,100%,61%,0.2)',
        borderColor: 'hsla(220,100%,61%,1)',
        borderWidth: 1,
        hoverBorderWidth: 4,
        type: 'bar'
      }]
    };

    let chartOptions = {
      // https://stackoverflow.com/questions/42556835/show-values-on-top-of-bars-in-chart-js
      animation: {
        onComplete: function() {
          var chartInstance = this.chart,
          ctx = chartInstance.ctx;

          ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          this.data.datasets.forEach(function(dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function(bar, index) {
              var data = dataset.data[index];
              ctx.fillText(data, bar._model.x, bar._model.y - 5);
            });
          });
        }
      },
      tooltips: {
        enabled: true,
        mode: 'single',
        //mode: 'dataset',
        callbacks: {
          label: function(tooltipItems, data) {
            if(tooltipItems.datasetIndex === 0)
              return tooltipItems.yLabel + "(F°)"
            return `${tooltipItems.yLabel} ${model.channel1RawUom}`;
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
              labelString: model.channel1RawUom,
              fontSize: 16
            },
            ticks: {
              beginAtZero: true,
              max: Math.ceil((Math.max(...chartData.datasets[1].data)+1)/10)*10
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
        ]
      },
      legend: {
        // display: false,
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
  
          this.data.datasets[activePoints[0]['_datasetIndex']].data[idx] = this.data.datasets[activePoints[0]['_datasetIndex']].data[idx] + 1
          this.options.scales.yAxes[0].ticks.max = Math.ceil((Math.max(...chartData.datasets[1].data)+1)/10)*10

          this.update()

          var label = this.data.labels[idx];
          var value = this.data.datasets[activePoints[0]['_datasetIndex']].data[idx];
  
          var datapoint = `label: ${label}\nvalue: ${value}`;
          console.log(datapoint);
        }

      }
    }

    controller.set('chartData', chartData);
    controller.set('chartOptions', chartOptions);

  }

});
