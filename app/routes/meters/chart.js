/*global Chart*/
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({

  model(params) {
    this.set('year', parseInt(params.year, 10));
    this.set('month', parseInt(params.month, 10));
    this.set('day', parseInt(params.day, 10));
    this.set('hour', parseInt(params.hour, 10));

    let date = new Date(`${params.year}/${params.month}/${params.day}`);
    date.setHours(this.get('hour'));

    this.set('date', date);

    // coordinates for Knoxville
    this.set('latitude', 35.973);
    this.set('longitude', -83.9695);
    
    return hash({
      meter: this.store.query('meter', {include: 'meter-intervals',
        filter: {
          id: params.id,
          year: this.get('year'),
          month: this.get('month'),
          day: this.get('day')}
        }).then(meters => meters.get("firstObject")),
      weather: this.store.queryRecord('weather', {latitude: this.get('latitude'), longitude: this.get('longitude'), year: this.get('year'), month: this.get('month'), day: this.get('day'), hour: this.get('hour')})
    });
  },
  
  setupController(controller, model) {
    this._super(controller, model);

    var howMany = 6;

    controller.set('latitude', this.get('latitude'));
    controller.set('longitude', this.get('longitude'));

    Chart.defaults.scale.gridLines.display = false;

    let date = (this.get('date'));

    let meterIntervalData = [];
    model.meter.meterIntervals.forEach(data => {
      meterIntervalData.push(data.get('readValue'));
    })

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
      arr[1].length = 0;
      for(i = 0; i < howMany; i++)
      {
        arr[1][i] = (typeof min !== 'undefined') && (arr[0][i] < min) ? min : (typeof max !== 'undefined') && (arr[0][i] > max) ? max : arr[0][i];
      }
    }

    function getTemperatureData(hour, arr) {
      arr.length = 0;
      let i;
      for(i = 0; i < howMany; i++)
      {
        arr.push(model.weather.hourly[(hour+i)%24].temperature);
      }
      return arr;
    }

    var data = [
      // temperature data
      [getTemperatureData(this.get('hour'),[]),[]],
      // meter data
      [meterIntervalData,[]],
      // time of day
      [
        [
          '12:00am', '1:00am',  '2:00am',
          '3:00am',  '4:00am',  '5:00am',
          '6:00am',  '7:00am',  '8:00am',
          '9:00am',  '10:00am', '11:00am',
          '12:00pm', '1:00pm',  '2:00pm',
          '3:00pm',  '4:00pm',  '5:00pm',
          '6:00pm',  '7:00pm',  '8:00pm',
          '9:00pm',  '10:00pm', '11:00pm'
        ],
        [
          '12:00am', '12:30am', '1:00am',  '1:30am',
          '2:00am',  '2:30am',  '3:00am',  '3:30am',
          '4:00am',  '4:30am',  '5:00am',  '5:30am',
          '6:00am',  '6:30am',  '7:00am',  '7:30am',
          '8:00am',  '8:30am',  '9:00am',  '9:30am',
          '10:00am', '10:30am', '11:00am', '11:30am',
          '12:00pm', '12:30pm', '1:00pm',  '1:30pm',
          '2:00pm',  '2:30pm',  '3:00pm',  '3:30pm',
          '4:00pm',  '4:30pm',  '5:00pm',  '5:30pm',
          '6:00pm',  '6:30pm',  '7:00pm',  '7:30pm',
          '8:00pm',  '8:30pm',  '9:00pm',  '9:30pm',
          '10:00pm', '10:30pm', '11:00pm', '11:30pm'
        ],
        [
          '12:00am', '12:15am', '12:30am', '12:45am', '1:00am',  '1:15am',
          '1:30am',  '1:45am',  '2:00am',  '2:15am',  '2:30am',  '2:45am',
          '3:00am',  '3:15am',  '3:30am',  '3:45am',  '4:00am',  '4:15am',
          '4:30am',  '4:45am',  '5:00am',  '5:15am',  '5:30am',  '5:45am',
          '6:00am',  '6:15am',  '6:30am',  '6:45am',  '7:00am',  '7:15am',
          '7:30am',  '7:45am',  '8:00am',  '8:15am',  '8:30am',  '8:45am',
          '9:00am',  '9:15am',  '9:30am',  '9:45am',  '10:00am', '10:15am',
          '10:30am', '10:45am', '11:00am', '11:15am', '11:30am', '11:45am',
          '12:00pm', '12:15pm', '12:30pm', '12:45pm', '1:00pm',  '1:15pm',
          '1:30pm',  '1:45pm',  '2:00pm',  '2:15pm',  '2:30pm',  '2:45pm',
          '3:00pm',  '3:15pm',  '3:30pm',  '3:45pm',  '4:00pm',  '4:15pm',
          '4:30pm',  '4:45pm',  '5:00pm',  '5:15pm',  '5:30pm',  '5:45pm',
          '6:00pm',  '6:15pm',  '6:30pm',  '6:45pm',  '7:00pm',  '7:15pm',
          '7:30pm',  '7:45pm',  '8:00pm',  '8:15pm',  '8:30pm',  '8:45pm',
          '9:00pm',  '9:15pm',  '9:30pm',  '9:45pm',  '10:00pm', '10:15pm',
          '10:30pm', '10:45pm', '11:00pm', '11:15pm', '11:30pm', '11:45pm'
        ]
      ]
    ]

    trimData(data[0], 0, 100);
    trimData(data[1], .5);
    let n = [6];

    let prevDataCount = 0;

    let chartData = {
      labels: data[2][0].slice(0,6),
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
            // return xLabels(tooltipItems[0].xLabel);
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
  
          data[activePoints[0]['_datasetIndex']][0][idx] = data[activePoints[0]['_datasetIndex']][0][idx] + 1;
          trimData(data[0], 0, 100);
          trimData(data[1], .5);
          let max = Math.max(...chartData.datasets[1].data);
          let increment = Math.floor(max/20) + 1;
          this.options.scales.yAxes[0].ticks.max = Math.ceil((max+increment));
          this.options.scales.yAxes[0].ticks.stepSize = this.options.scales.yAxes[0].ticks.max / 6;
          
          
          this.update();
        }

      },
      onResize: function(chart, size) {
        let dataCount;
        
        if(size.width > 2116)
          dataCount = 36;
        else if(size.width > 1786)
          dataCount = 30;
        else if(size.width > 1456)
          dataCount = 24;
        else if(size.width > 1126)
          dataCount = 18;
        else if(size.width > 796)
          dataCount = 12;
        else if(size.width > 466)
          dataCount = 6;
        else
          dataCount = 3;
        
        if(dataCount != prevDataCount) {
          prevDataCount = dataCount;
          chartData.labels = data[2][0].slice(0,dataCount);
          chart.update();
        }
      }
    }

    controller.set('chartData', chartData);
    controller.set('chartOptions', chartOptions);

  }

});
