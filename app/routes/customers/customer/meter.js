/*global Chart*/
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({

  model(params) {
    this.set('params',params);

    // current day
    let currentDay = new Date(params.year, params.month - 1, 1);
    currentDay.setHours(0,0,0,0);
    
    // next day
    let nextDay = new Date(currentDay);
    nextDay.setDate(nextDay.getDate() + 1);
    
    let monthCount = 3;

    // current month
    let currentMonth = new Date(currentDay);
    currentMonth.setDate(1);
    currentMonth.setMonth(currentMonth.getMonth() - monthCount + 1);
    
    // current month UTC
    let currentMonthUTC = new Date(currentDay);
    currentMonthUTC.setUTCDate(1);
    currentMonthUTC.setUTCMonth(currentMonthUTC.getUTCMonth() - monthCount + 1);

    // next month
    let nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + monthCount);
    
    // current month (previous year)
    let currentMonthPrevious = new Date(currentMonth);
    currentMonthPrevious.setFullYear(currentMonthPrevious.getFullYear() - 1);

    // current month UTC (previous year)
    let currentMonthPreviousUTC = new Date(currentMonthUTC);
    currentMonthPreviousUTC.setUTCFullYear(currentMonthPreviousUTC.getUTCFullYear() - 1);

    this.set('currentMonths',[currentMonthPreviousUTC,currentMonthUTC]);
    
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
      [],[],[]
    [hourly]
    */
    let labels = [
      [],
      [[new Array(monthCount)]],
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


    function leapYear(year)
    {
      return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    }

    let currentYears = new Array(monthCount);
    let previousYears = new Array(monthCount);

    for(let i = 0; i < monthCount; i++)
    {
      // generate month labels
      labels[0].push(months[(currentMonthUTC.getUTCMonth() + i) % 12]);
      
      let monthRange;

      let currentMonthYear = new Date(currentMonthUTC);
      currentMonthYear.setUTCMonth(currentMonthYear.getUTCMonth() + i);
      let previousMonthYear = new Date(currentMonthPreviousUTC);
      previousMonthYear.setUTCMonth(previousMonthYear.getUTCMonth() + i);

      currentYears[i] = currentMonthYear.getUTCFullYear();
      previousYears[i] = previousMonthYear.getUTCFullYear();

      // use current year if it's a leap year, else use previous year (whether it's a leap year or not)
      if(leapYear(currentMonthUTC.getUTCFullYear()))
      {
        monthRange = [new Date(currentMonthUTC), new Date(currentMonthUTC)];
      }
      else
      {
        monthRange = [new Date(currentMonthPreviousUTC), new Date(currentMonthPreviousUTC)];
      }

      monthRange[1].setUTCMonth(monthRange[0].getUTCMonth() + i + 1);
      monthRange[0].setUTCMonth(monthRange[0].getUTCMonth() + i);
      
      labels[1][i] = [];
      
      // generate daily labels
      while(monthRange[0].getTime() < monthRange[1].getTime())
      {
        labels[1][i].push(`${monthRange[0].getUTCMonth()+1} / ${monthRange[0].getUTCDate()}`);
        
        monthRange[0].setUTCDate(monthRange[0].getUTCDate() + 1);
      }
    }

    this.set('labels',labels);
    this.set('currentYears', currentYears);
    this.set('previousYears', previousYears);

    function getYearRange(years)
    {
      let last = monthCount - 1;

      if(years[0] === years[last])
        return years[0];
      
      return `${years[0]} - ${years[last]}`;
    }

    this.set('currentYear', getYearRange(currentYears));
    this.set('previousYear', getYearRange(previousYears));

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

    controller.set("chartInstance", undefined);

    controller.set("dailyDisabled", true);
    controller.set("hourlyDisabled", true);

    controller.set("navDisabled", true);

    controller.set("actions", {
      updateChart: updateChart,
      changeIndex: function(amount) {
        let level = controller.get("level");
        let chartIndex = controller.get("chartIndex");

        chartIndex[level] = chartIndex[level] + amount;

        chartIndex[level] = chartIndex[level] < 0 ? 0 : chartIndex[level];

        controller.set("chartIndex", chartIndex);

        updateChart(level);
      }
    })

    controller.set("route", this);
    controller.set("params", this.get('params'));
    controller.set("labels", this.get('labels'));
    controller.set("currentMonths", this.get('currentMonths'));

    Chart.defaults.scale.gridLines.display = false;

    // aggregating functions
    const arrSum = arr => arr.reduce((a,b) => {
      if(a === null && b === null)
        return null;
      return a + b;
    }, null);
    const arrAvg = arr => {
      let sum = arrSum(arr);
      if(sum === null)
        return null;
      return sum / arr.length;
    }

    // get temperature data
    // [monthlyPrevious] [monthly]
    // [dailyPrevious] [daily]
    // [hourlyPrevious] [hourly]
    controller.set("weatherData", [
      [[],[]],
      [[],[]],
      [[],[]]
    ]);

    // get meter data
    // [monthlyPrevious] [monthly]
    // [dailyPrevious] [daily]
    // [hourlyPrevious] [hourly]
    controller.set("meterIntervalData", [
      [[],[]],
      [[],[]],
      [[],[]]
    ]);
    
    // keep track of level (monthly, daily, hourly)
    controller.set("level", 0);
    controller.set("prevLevel", 0);
    controller.set("selectedYear", 0);
    controller.set("selectedMonth", 0);
    controller.set("selectedDay", 0);


    function aggregateData(model, dataArray, dataset, valueData, dateData, aggregateFunction)
    {
      if(model.firstObject)
      {
        let currentTime = new Date(controller.get("currentMonths")[dataset]);
        let baseMonth = currentTime.getUTCMonth();

        // keep track of day to aggregate daily data
        // set prevDay to midnight
        let prevDay = model.firstObject.get(dateData);
        
        // keep track of month to aggregate monthly data
        // set prevMonth to first day of month
        let prevMonth = new Date(prevDay)
        prevMonth.setUTCDate(1);
  
        // initialize month and day phase
        let monthPhase = 0;
        let dayPhase = 0;

        let prevMonthOffset = prevMonth.getUTCMonth() - baseMonth;
        prevMonthOffset = prevMonthOffset < 0 ? prevMonthOffset + 12 : prevMonthOffset;

        let prevDayOffset = prevDay.getUTCDate() - 1;
  
        // daily data
        dataArray[1][dataset][prevMonthOffset] = [];
        // hourly data
        dataArray[2][dataset][prevMonthOffset] = [];
        dataArray[2][dataset][prevMonthOffset][prevDayOffset] = [];
        
        model.forEach(data => {

          let currentDay = data.get(dateData);

          let hourOffset = currentDay.getUTCHours();

          currentDay.setUTCHours(0,0,0,0);

          let currentMonth = new Date(currentDay)
          currentMonth.setUTCDate(1);

          let currentMonthOffset = currentMonth.getUTCMonth() - baseMonth;
          currentMonthOffset = currentMonthOffset < 0 ? currentMonthOffset + 12 : currentMonthOffset;

          let currentDayOffset = currentDay.getUTCDate() - 1;
          
          let last = model.lastObject.get("id") == data.get("id");
  
  

          if(prevDayOffset != currentDayOffset)
          {
            
            
            // daily data
            dataArray[1][dataset][prevMonthOffset][prevDayOffset] = aggregateFunction(dataArray[2][dataset][prevMonthOffset][prevDayOffset]);
            
            if(prevMonthOffset === currentMonthOffset)
            {
              // hourly data
              dataArray[2][dataset][currentMonthOffset][currentDayOffset] = [];
            }
            
            
            prevDayOffset = currentDayOffset;
            // dayPhase++;
          }
          
          if(prevMonthOffset != currentMonthOffset)
          {
            
            
            // hourly data
            // dataArray[2][dataset][monthPhase].pop();
            // dayPhase = 0;
            
            
            // monthly data
            dataArray[0][dataset][prevMonthOffset] = aggregateFunction(dataArray[1][dataset][prevMonthOffset]);


            // daily data
            dataArray[1][dataset][currentMonthOffset] = [];
            // hourly data
            dataArray[2][dataset][currentMonthOffset] = [];
            dataArray[2][dataset][currentMonthOffset][currentDayOffset] = [];


            // daily data
            // dataArray[1][dataset].push([]);
            // hourly data
            // dataArray[2][dataset].push([[]]);
            
            prevMonthOffset = currentMonthOffset;
            
            // monthPhase++;
          }

          // hourly data
          dataArray[2][dataset][currentMonthOffset][currentDayOffset][hourOffset] = data.get(valueData);
          
          if(last)
          {          
  
            // daily data
            dataArray[1][dataset][currentMonthOffset][currentDayOffset] = aggregateFunction(dataArray[2][dataset][currentMonthOffset][currentDayOffset]);
            // monthly data
            dataArray[0][dataset][currentMonthOffset] = aggregateFunction(dataArray[1][dataset][currentMonthOffset]);
  
            console.log(dataArray[0][dataset])
            console.log(dataArray[1][dataset])
            console.log(dataArray[2][dataset])
  
          }
          
        });
      }
    }

    aggregateData(model.meterIntervalsPrevious, controller.get("meterIntervalData"), 0, "readValue", "readDateTime", arrSum);
    aggregateData(model.meterIntervals, controller.get("meterIntervalData"), 1, "readValue", "readDateTime", arrSum);
    aggregateData(model.weatherPrevious, controller.get("weatherData"), 0, "value", "readDateTime", arrAvg);
    aggregateData(model.weather, controller.get("weatherData"), 1, "value", "readDateTime", arrAvg);

    // prevent data points from going above/below a max/min, but still retain original data
    function trimData(arr, min, max) {
      let i;
      let length;
      if(arr[0])
        length = arr[0].length;
      else
        length = 0;
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

    controller.set("data", [
      // temperature data (previous)
      [controller.get("weatherData")[0][0],[]],
      // temperature data (current)
      [controller.get("weatherData")[0][1],[]],
      // meter data (previous)
      [controller.get("meterIntervalData")[0][0],[]],
      // meter data (current)
      [controller.get("meterIntervalData")[0][1],[]],
    ]);

    trimData(controller.get("data")[0], 0, 100);
    trimData(controller.get("data")[1], 0, 100);
    trimData(controller.get("data")[2]);
    trimData(controller.get("data")[3]);

    
    controller.set("chartData", {
      labels: controller.get("labels")[0],
      datasets: [{
        yAxisID: 'temperature',
        label: `Temperature (${this.get('previousYear')})`,
        data: controller.get("data")[0][1],
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
        data: controller.get("data")[1][1],
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
        data: controller.get("data")[2][1],
        backgroundColor:  'hsla(220,0%,61%,0.2)',
        borderColor: 'hsla(220,0%,61%,1)',
        borderWidth: 1,
        hoverBorderWidth: 4,
        type: 'bar'
      },{
        yAxisID: 'meter',
        label: `${model.meter.serviceType} (${this.get('currentYear')})`,
        data: controller.get("data")[3][1],
        backgroundColor:  'hsla(220,100%,61%,0.2)',
        borderColor: 'hsla(220,100%,61%,1)',
        borderWidth: 1,
        hoverBorderWidth: 4,
        type: 'bar'
      }]
    });

    function updateChart(currentLevel, idx, dataset)
    {
      let chartIndex = controller.get("chartIndex");
      let adjustedIndex = controller.get("adjustedIndex");
      let chartData = controller.get("chartData");
      let data = controller.get("data");
      let weatherData = controller.get("weatherData");
      let meterIntervalData = controller.get("meterIntervalData");
      let level = controller.get("level");
      let prevLevel = controller.get("prevLevel");
      let chartInstance = controller.get("chartInstance");

      let selectedYear = controller.get("selectedYear");
      let selectedMonth = controller.get("selectedMonth");
      let selectedDay = controller.get("selectedDay");
      let labels = controller.get("labels");

      let prevDataCount = controller.get("prevDataCount");

      level = currentLevel >= 2 ? 2 : currentLevel <= 0 ? 0 : currentLevel;

      // update selectedMonth or selectedDay if level increases
      // but don't update if level decreases (not yet implemented)
      let levelIncreased = prevLevel < level;
      prevLevel = level;


      if(level >= 0)
        controller.set("monthlyDisabled", false);
      else
        controller.set("monthlyDisabled", true);

      if(level >= 1)
        controller.set("dailyDisabled", false);
      else
        controller.set("dailyDisabled", true);

      if(level >= 2)
        controller.set("hourlyDisabled", false);
      else
        controller.set("hourlyDisabled", true);

      if(level === 1)
      {
        if(levelIncreased)
        {
          selectedMonth = idx + chartIndex[level - 1];
        }
        chartData.labels = labels[level][selectedMonth];
      }
      else
      {
        if(level === 2 && levelIncreased)
        {
          selectedDay = idx + chartIndex[level - 1];
        }
        chartData.labels = labels[level];
      }

      if(levelIncreased)
        chartIndex[level] = 0;

      // update chart with no data so transition to new data doesn't look strange (occurs when increasing the amount of labels)
      data[0][1].length = 0;
      data[1][1].length = 0;
      data[2][1].length = 0;
      data[3][1].length = 0;

      if(level === 0)
      {
        chartInstance.getDatasetMeta(0).hidden = false;
        chartInstance.getDatasetMeta(1).hidden = false;
        chartInstance.getDatasetMeta(2).hidden = false;
        chartInstance.getDatasetMeta(3).hidden = false;
      }
      else if(dataset !== undefined)
      {
        // set dataset to meter's dataset if temperature dataset is clicked
        // dataset 0 = temperature (previous)
        // dataset 1 = temperature (current)
        // dataset 2 = meter intervals (previous)
        // dataset 3 = meter intervals (current)
        dataset = dataset <= 1 ? dataset + 2 : dataset;

        selectedYear = dataset - 2;

        // hide other datasets
        chartInstance.getDatasetMeta(3 - dataset).hidden = true;
        chartInstance.getDatasetMeta(5 - dataset).hidden = true;

        // show selected dataset (if hidden)
        chartInstance.getDatasetMeta(dataset - 2).hidden = false;
        chartInstance.getDatasetMeta(dataset).hidden = false;
      }

      // if data spans across a year (december - january), update chart legend to reflect current data's year when going down the intervals
      if(level === 0)
      {
        chartData.datasets[0].label = `Temperature (${controller.get('route').get('previousYear')})`;
        chartData.datasets[1].label = `Temperature (${controller.get('route').get('currentYear')})`;
        chartData.datasets[2].label = `${model.meter.serviceType} (${controller.get('route').get('previousYear')})`;
        chartData.datasets[3].label = `${model.meter.serviceType} (${controller.get('route').get('currentYear')})`;
      }
      else
      {
        chartData.datasets[0].label = `Temperature (${controller.get('route').get('previousYears')[selectedMonth]})`;
        chartData.datasets[1].label = `Temperature (${controller.get('route').get('currentYears')[selectedMonth]})`;
        chartData.datasets[2].label = `${model.meter.serviceType} (${controller.get('route').get('previousYears')[selectedMonth]})`;
        chartData.datasets[3].label = `${model.meter.serviceType} (${controller.get('route').get('currentYears')[selectedMonth]})`;
      }

      chartInstance.update();

      // update chart with new data from current level
      if(level === 0)
      {
        // update chart title
        chartInstance.options.title.text[1] = `(${controller.get("labels")[0].toString().replace(/,/g,", ")})`;

        // temperature data (previous)
        data[0][0] = weatherData[level][0];
        // temperature data (current)
        data[1][0] = weatherData[level][1];
        // meter data (previous)
        data[2][0] = meterIntervalData[level][0];
        // meter data (current)
        data[3][0] = meterIntervalData[level][1];
      }
      else if(level === 1)
      {
        // update chart title
        chartInstance.options.title.text[1] = `(${controller.get("labels")[0][selectedMonth]})`;

        // temperature data (previous)
        if(weatherData[level][0][selectedMonth])
          data[0][0] = weatherData[level][0][selectedMonth];
        else
          data[0][0] = [];

        // temperature data (current)
        if(weatherData[level][1][selectedMonth])
          data[1][0] = weatherData[level][1][selectedMonth];
        else
          data[1][0] = [];

        // meter data (previous)
        if(meterIntervalData[level][0][selectedMonth])
          data[2][0] = meterIntervalData[level][0][selectedMonth];
        else
          data[2][0] = [];

        // meter data (current)
        if(meterIntervalData[level][1][selectedMonth])
          data[3][0] = meterIntervalData[level][1][selectedMonth];
        else
          data[3][0] = [];
      }
      else
      {
        // update chart title
        chartInstance.options.title.text[1] = `(${controller.get("labels")[0][selectedMonth]} ${selectedDay + 1})`;

        // temperature data (previous)
        if(weatherData[level][0][selectedMonth] && weatherData[level][0][selectedMonth][selectedDay])
          data[0][0] = weatherData[level][0][selectedMonth][selectedDay];
        else
          data[0][0] = [];

        // temperature data (current)
        if(weatherData[level][1][selectedMonth] && weatherData[level][1][selectedMonth][selectedDay])
          data[1][0] = weatherData[level][1][selectedMonth][selectedDay];
        else
          data[1][0] = [];

        // meter data (previous)
        if(meterIntervalData[level][0][selectedMonth] && meterIntervalData[level][0][selectedMonth][selectedDay])
          data[2][0] = meterIntervalData[level][0][selectedMonth][selectedDay];
        else
          data[2][0] = [];

        // meter data (current)
        if(meterIntervalData[level][1][selectedMonth] && meterIntervalData[level][1][selectedMonth][selectedDay])
          data[3][0] = meterIntervalData[level][1][selectedMonth][selectedDay];
        else
          data[3][0] = [];
      }

      let itemCount = chartData.labels.length;
      
      let maxIndex = itemCount - prevDataCount;
      maxIndex = maxIndex < 0 ? 0 : maxIndex;
      adjustedIndex = chartIndex[level] > maxIndex ? maxIndex : chartIndex[level];
      chartIndex[level] = adjustedIndex;

      if(itemCount <= prevDataCount)
      {
        controller.set("navDisabled", true);
      }
      else
      {
        for(let i = 0; i < 4; i++)
        {
          data[i][0] = data[i][0].slice(adjustedIndex, prevDataCount + adjustedIndex);
        }
        chartData.labels = chartData.labels.slice(adjustedIndex, prevDataCount + adjustedIndex);
        controller.set("navDisabled", false);
      }

      trimData(data[0], 0, 100);
      trimData(data[1], 0, 100);
      trimData(data[2]);
      trimData(data[3]);

      controller.set("chartIndex", chartIndex);
      controller.set("adjustedIndex", adjustedIndex);
      controller.set("chartData", chartData);
      controller.set("data", data);
      controller.set("weatherData", weatherData);
      controller.set("meterIntervalData", meterIntervalData);
      controller.set("level", level);
      controller.set("prevLevel", prevLevel);
      controller.set("chartInstance", chartInstance);

      controller.set("selectedYear", selectedYear);
      controller.set("selectedMonth", selectedMonth);
      controller.set("selectedDay", selectedDay);

      chartInstance.update();
    }

    controller.set("prevDataCount", 36);
    controller.set("chartIndex", [0, 0, 0]);
    controller.set("adjustedIndex", 0);

    function trimChart()
    {
      let dataCount;
      let prevDataCount = controller.get("prevDataCount");


      if(window.innerWidth > 1890)
        dataCount = 36;
      else if(window.innerWidth > 1620)
        dataCount = 30;
      else if(window.innerWidth > 1350)
        dataCount = 24;
      else if(window.innerWidth > 1080)
        dataCount = 18;
      else if(window.innerWidth > 810)
        dataCount = 12;
      else if(window.innerWidth > 540)
        dataCount = 6;
      else
        dataCount = 3;

      
      if(dataCount != prevDataCount) {
        prevDataCount = dataCount;
        controller.set("prevDataCount", prevDataCount);

        updateChart(controller.get("level"));
      }


    }

    controller.set("chartOptions", {
      title: {
        display: true,
        fontSize: 14,
        padding: 30,
        text: [`Meter: ${model.meter.id}`, `(${controller.get("labels")[0].toString().replace(/,/g,", ")})`]
      },
      animation: {
        onProgress: function() {
          if(controller.get("chartInstance") === undefined) {
            controller.set("chartInstance", this);
            controller.set("monthlyDisabled", false);

            trimChart();
          }
        },
        onComplete: function() {
          if(controller.get("chartInstance") === undefined) {
            controller.set("chartInstance", this);
            controller.set("monthlyDisabled", false);

            trimChart();
          }
        }
      },
      plugins: {
        datalabels: {
          align: 'top',
          anchor: 'end',
          formatter: function(value, context) {
            return parseFloat(controller.get("data")[context.datasetIndex][0][context.dataIndex]).toFixed(2);
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
            return `${parseFloat(controller.get("data")[tooltipItem.datasetIndex][0][tooltipItem.index]).toFixed(2)} ${uom}`;
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
        },
        position: 'bottom'
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

          if(controller.get("chartInstance") === undefined) {
            controller.set("chartInstance", chart);
            controller.set("monthlyDisabled", false);
          }

          updateChart(controller.get("level")+1, idx, dataset);

        }

      },
      onResize: trimChart
    });

  }
});
