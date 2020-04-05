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

    this.set('currentMonths',[currentMonth,currentMonthPrevious]);
    
    // next month (previous year)
    let nextMonthPrevious = new Date(currentMonthPrevious);
    nextMonthPrevious.setMonth(nextMonthPrevious.getMonth() + monthCount);

    let dayRange = `ge:${currentDay.toLocaleDateString()},lt:${nextDay.toLocaleDateString()}`;
    let monthRange = `ge:${currentMonth.toLocaleDateString()},lt:${nextMonth.toLocaleDateString()}`;
    let monthRangePrevious = `ge:${currentMonthPrevious.toLocaleDateString()},lt:${nextMonthPrevious.toLocaleDateString()}`;

    let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    /*
    [monthly]
    [daily]

      [previous]

        [],[],[]

      [current]

        [],[],[]

    [hourly]
    */
    let labels = [
      [],
      [
        [new Array(monthCount)],
        [new Array(monthCount)]
      ],
      [
        '12:00am', '1:00am',  '2:00am',
        '3:00am',  '4:00am',  '5:00am',
        '6:00am',  '7:00am',  '8:00am',
        '9:00am',  '10:00am', '11:00am',
        '12:00pm', '1:00pm',  '2:00pm',
        '3:00pm',  '4:00pm',  '5:00pm',
        '6:00pm',  '7:00pm',  '8:00pm',
        '9:00pm',  '10:00pm', '11:00pm'
      ]
    ];

    for(let i = 0; i < monthCount; i++)
    {
      // generate month labels
      labels[0].push(months[(currentMonth.getMonth() + i) % 12]);

      // generate daily labels (previous year)
      let currentMonthsPrevious = [new Date(currentMonthPrevious), new Date(currentMonthPrevious)];
      currentMonthsPrevious[0].setMonth(currentMonthsPrevious[0].getMonth() + i);
      currentMonthsPrevious[1].setMonth(currentMonthsPrevious[0].getMonth() + 1);

      labels[1][0][i] = [];
      
      while(currentMonthsPrevious[0].getTime() < currentMonthsPrevious[1].getTime())
      {
        labels[1][0][i].push(currentMonthsPrevious[0].toLocaleDateString());
        
        currentMonthsPrevious[0].setDate(currentMonthsPrevious[0].getDate() + 1);
      }

      // generate daily labels (current year)
      let currentMonths = [new Date(currentMonth), new Date(currentMonth)];
      currentMonths[0].setMonth(currentMonths[0].getMonth() + i);
      currentMonths[1].setMonth(currentMonths[0].getMonth() + 1);
      
      labels[1][1][i] = [];
      
      while(currentMonths[0].getTime() < currentMonths[1].getTime())
      {
        labels[1][1][i].push(currentMonths[0].toLocaleDateString());
        
        currentMonths[0].setDate(currentMonths[0].getDate() + 1);
      }
    }

    this.set('labels',labels);
    this.set('currentYear',currentMonth.getFullYear());
    this.set('previousYear',currentMonthPrevious.getFullYear());

    return hash({
      meter: this.store.findRecord('meter', params.meterId),
      meterIntervals: this.store.query('meterInterval', {
        filter: {
          "meter.id": params.meterId,
          readdatetime: monthRange,
          channelId: 1
        },
        sort: "readdatetime"
      }),
      meterIntervalsPrevious: this.store.query('meterInterval', {
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
      }),
      weatherPrevious: this.store.query('weather', {
        filter: {
          readdatetime: monthRangePrevious,
          dataTypeId: "TEMPERATURE"
        },
        sort: "readdatetime"
      }),
      dailyWeather: null,
      hourlyWeather: null,
      dailyMeterIntervals: null,
      hourlyMeterIntervals: null
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
    // [monthlyPrevious] [monthly]
    // [dailyPrevious] [daily]
    // [hourlyPrevious] [hourly]
    let weatherData = [
      [[],[]],
      [[],[]],
      [[],[]]
    ];

    // get meter data
    // [monthlyPrevious] [monthly]
    // [dailyPrevious] [daily]
    // [hourlyPrevious] [hourly]
    let meterIntervalData = [
      [[],[]],
      [[],[]],
      [[],[]]
    ];
    
    // keep track of data to aggregate
    let dataValues = [];


    function aggregateData(model, dataArray, dataset, valueData, dateData, aggregateFunction)
    {
      if(model.firstObject)
      {
        // keep track of day to aggregate daily data
        // set prevDay to midnight
        let prevDay = model.firstObject.get(dateData).setHours(0,0,0,0);
        
        // keep track of month to aggregate monthly data
        // set prevMonth to first day of month
        let prevMonth = new Date(prevDay).setDate(1);
  
        // initialize month and day phase
        let monthPhase = 0;
        let dayPhase = 0;
  
        // daily data
        dataArray[1][dataset].push([]);
        // hourly data
        dataArray[2][dataset].push([[]]);
        
        model.forEach(data => {
  
          let currentDay = data.get(dateData).setHours(0,0,0,0);
  
          let currentMonth = new Date(currentDay).setDate(1);
  
          let last = model.lastObject.get("id") == data.get("id");
  
  
          if(last)
          {          
  
            // hourly data
            dataArray[2][dataset][monthPhase][dayPhase].push(data.get(valueData));
            // daily data
            dataArray[1][dataset][monthPhase].push(aggregateFunction(dataArray[2][dataset][monthPhase][dayPhase]));
            // monthly data
            dataArray[0][dataset].push(aggregateFunction(dataArray[1][dataset][monthPhase]));
  
            console.log(dataArray[0][dataset])
            console.log(dataArray[1][dataset])
            console.log(dataArray[2][dataset])
  
          }
          else
          {
            if(prevDay != currentDay)
            {
              prevDay = currentDay;
  
              
              // daily data
              dataArray[1][dataset][monthPhase].push(aggregateFunction(dataArray[2][dataset][monthPhase][dayPhase]));
              // hourly data
              dataArray[2][dataset][monthPhase].push([]);
              
              
              dayPhase++;
            }
            
            if(prevMonth != currentMonth)
            {
              prevMonth = currentMonth;
              
              
              // hourly data
              dataArray[2][dataset][monthPhase].pop();
              dayPhase = 0;
              
              
              // monthly data
              dataArray[0][dataset].push(aggregateFunction(dataArray[1][dataset][monthPhase]));
              // daily data
              dataArray[1][dataset].push([]);
              // hourly data
              dataArray[2][dataset].push([[]]);
              
              
              monthPhase++;
            }
            
            dataArray[2][dataset][monthPhase][dayPhase].push(data.get(valueData));
          }
          
        });
      }
    }

    aggregateData(model.meterIntervalsPrevious, meterIntervalData, 0, "readValue", "readDateTime", arrSum);
    aggregateData(model.meterIntervals, meterIntervalData, 1, "readValue", "readDateTime", arrSum);
    aggregateData(model.weatherPrevious, weatherData, 0, "value", "readDateTime", arrAvg);
    aggregateData(model.weather, weatherData, 1, "value", "readDateTime", arrAvg);

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
      // temperature data (previous)
      [weatherData[0][0],[]],
      // temperature data (current)
      [weatherData[0][1],[]],
      // meter data (previous)
      [meterIntervalData[0][0],[]],
      // meter data (current)
      [meterIntervalData[0][1],[]],
    ]

    trimData(data[0], 0, 100);
    trimData(data[1], 0, 100);
    trimData(data[2]);
    trimData(data[3]);

    
    let chartData = {
      labels: labels[0],
      datasets: [{
        yAxisID: 'temperature',
        label: `Temperature (${this.get('previousYear')})`,
        data: data[0][1],
        borderColor: 'hsla(220,0%,41%,.8)',
        borderWidth: 1,
        type: 'line',
        fill: false,
        lineTension: 0.5,
        pointBackgroundColor: 'hsla(220,0%,41%,0.2)',
        pointHoverBorderWidth: 2,
        pointRadius: 5,
        pointHitRadius: 5,
        pointHoverRadius: 5,
        spanGaps: true
      },{
        yAxisID: 'temperature',
        label: `Temperature (${this.get('currentYear')})`,
        data: data[1][1],
        borderColor: 'hsla(220,100%,41%,.8)',
        borderWidth: 1,
        type: 'line',
        fill: false,
        lineTension: 0.5,
        pointBackgroundColor: 'hsla(220,100%,41%,0.2)',
        pointHoverBorderWidth: 2,
        pointRadius: 5,
        pointHitRadius: 5,
        pointHoverRadius: 5,
        spanGaps: true
      },{
        yAxisID: 'meter',
        label: `${model.meter.serviceType} (${this.get('previousYear')})`,
        data: data[2][1],
        backgroundColor:  'hsla(220,0%,61%,0.2)',
        borderColor: 'hsla(220,0%,61%,1)',
        borderWidth: 1,
        hoverBorderWidth: 4,
        type: 'bar'
      },{
        yAxisID: 'meter',
        label: `${model.meter.serviceType} (${this.get('currentYear')})`,
        data: data[3][1],
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
            // hide the temperature labels
            if(context.datasetIndex <= 1)
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
            let uom = tooltipItem.datasetIndex <= 1 ? 'F°' : model.meter.channel1RawUom;
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
  
          let dataset = activePoints[0]['_datasetIndex'];

          let chart = this;

          // selected month
          let selectedCurrentMonth = new Date(route.get('currentMonths')[2 - dataset]);
          selectedCurrentMonth.setMonth(selectedCurrentMonth.getMonth() + idx);

          // next month after selected month
          let selectedNextMonth = new Date(selectedCurrentMonth);
          selectedNextMonth.setMonth(selectedNextMonth.getMonth() + 1);

          let selectedMonthRange = `ge:${selectedCurrentMonth.toLocaleDateString()},lt:${selectedNextMonth.toLocaleDateString()}`;

          let weatherInit = false;
          let intervalsInit = false;

          route.store.query('weather', {
            filter: {
              readdatetime: selectedMonthRange,
              dataTypeId: "TEMPERATURE"
            },
            sort: "readdatetime"
          }).then(data => {
            model.dailyWeather = data;
            weatherInit = true;
          })

          route.store.query('meterInterval', {
            filter: {
              "meter.id": params.meterId,
              readdatetime: selectedMonthRange,
              channelId: 1
            },
            sort: "readdatetime"
          }).then(data => {
            model.dailyMeterIntervals = data;
            intervalsInit = true;
          })

          let loopCount = 0;

          // keep looping until weather data and meter interval data is initialized
          let loop = setInterval(function()
          {
            console.log(++loopCount);
            console.log(`weatherInit: ${weatherInit}`);
            console.log(`intervalsInit: ${intervalsInit}`);

            // retrieve weather data
            if(weatherInit && intervalsInit)
            {
              clearInterval(loop);

              if(model.dailyWeather.firstObject)
              {

                labels[0].length = 0;

                // keep track of date in order to aggregate data
                let prevDate = model.dailyWeather.firstObject.get("readDateTime");
                // set prevDate to midnight
                prevDate.setHours(0,0,0,0);

                // keep track of data to aggregate
                let dataValues = [];

                weatherData[1][0] = [];

                model.dailyWeather.forEach(data => {

                  let nextDate = data.get('readDateTime');
                  nextDate.setHours(0,0,0,0);
            
                  if(prevDate.getTime() == nextDate.getTime() && model.dailyWeather.lastObject.get("id") != data.get("id"))
                  {
                    dataValues.push(data.get('value'));
                  }
                  else
                  {
                    if(model.dailyWeather.lastObject.get("id") == data.get("id"))
                    {
                      dataValues.push(data.get('value'));
                    }
            
                    labels[0].push(prevDate.toLocaleDateString());
                    prevDate = nextDate;
            
                    weatherData[1][0].push(arrAvg(dataValues));
                    
                    dataValues = [];
                    dataValues.push(data.get('value'));
                  }

                  
                })

              }

              // retrieve meter interval data
              if(model.dailyMeterIntervals.firstObject)
              {

                // keep track of date in order to aggregate data
                let prevDate = model.dailyMeterIntervals.firstObject.get("readDateTime");
                // set prevDate to midnight
                prevDate.setHours(0,0,0,0);

                // keep track of data to aggregate
                let dataValues = [];

                meterIntervalData[1][0] = [];

                model.dailyMeterIntervals.forEach(data => {

                  let nextDate = data.get('readDateTime');
                  nextDate.setHours(0,0,0,0);
            
                  if(prevDate.getTime() == nextDate.getTime() && model.dailyMeterIntervals.lastObject.get("id") != data.get("id"))
                  {
                    dataValues.push(data.get('readValue'));
                  }
                  else
                  {
                    if(model.dailyMeterIntervals.lastObject.get("id") == data.get("id"))
                    {
                      dataValues.push(data.get('readValue'));
                    }

                    prevDate = nextDate;
            
                    meterIntervalData[1][0].push(arrSum(dataValues));
                    
                    dataValues = [];
                    dataValues.push(data.get('readValue'));
                  }

                  
                })

              }

              // update chart with no data so transition to new data doesn't look strange (occurs when increasing the amount of labels)
              data[dataset][1].length = 0;
              chart.update();

              data[0][0] = weatherData[1][0];
              data[dataset][0] = meterIntervalData[1][0];
              trimData(data[0], 0, 100);
              trimData(data[dataset]);
              
              // hide other dataset
              chart.getDatasetMeta(3 - dataset).hidden = true;
              
              // clear data from other dataset (in case user clicks legend to display hidden dataset)
              data[3 - dataset][1].length = 0;

              chart.update();

            }

          }, 500);
          
        }

      }
    }

    controller.set('chartData', chartData);
    controller.set('chartOptions', chartOptions);
  }
});
