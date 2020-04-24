# React-native AmCharts : - WIP


#### Unofficial React-Native wrapper package for using [AmCharts](https://www.amcharts.com/).

### Features
1. Fully customizable wrapper for AmCharts4 using [JSON-based Config](https://www.amcharts.com/docs/v4/concepts/json-config/#Structure_of_JSON_config).
2. All scripts loaded in the package  no CDN dependency for faster performance.
3. Supported on Ios and Android.

### Installing
Get package from NPM in your React-native app:

```npm i react-native-amcharts```

### Basic Usage Example

```javascript
import React from 'react';
import {Stylesheet} from 'react-native';
import {ReactNativeAmChart} from 'react-native-amcharts';

const config = {
  // Create pie series
  series: [
    {
      type: 'PieSeries',
      dataFields: {
        value: 'litres',
        category: 'country',
      },
    },
  ],

  // Add data
  data: [
    {
      country: 'Lithuania',
      litres: 501.9,
    },
    {
      country: 'Czech Republic',
      litres: 301.9,
    },
    {
      country: 'Ireland',
      litres: 201.1,
    },
    {
      country: 'Germany',
      litres: 165.8,
    },
    {
      country: 'Australia',
      litres: 139.9,
    },
    {
      country: 'Austria',
      litres: 128.3,
    },
    {
      country: 'UK',
      litres: 99,
    },
    {
      country: 'Belgium',
      litres: 60,
    },
    {
      country: 'The Netherlands',
      litres: 50,
    },
  ],

  // And, for a good measure, let's add a legend
  legend: {},
};

const App = () => {
  return (
    <>
      <ReactNativeAmChart 
        chartConfig={config} 
        chartType="PieChart" 
        style={styles.chartContainer} 
        initialScale={0.9}
        maximumScale={0.9}/>
    </>
  );
};

const styles = Stylesheet.create({
    chartContainer: {
        height: '50%',
        width: '100%',
    }
})
export default App;
```


#### Props Defitnition

- **style**  Styling chart container

- **chartType** Chart type definition from amcharts library

- **chartConfig**  JSON config for displaying the charts

- **initialScale** Initial Viewport scale for frame

- **maximumScale** Maximum Viewport scale for frame



##### Feature in progress

- Dynamic data addition to graph

