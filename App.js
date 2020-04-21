/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StatusBar} from 'react-native';
import BaseComponent from './src/BaseComponent';

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
      <StatusBar barStyle="dark-content" />
      <BaseComponent chartConfig={config} chartType="PieChart" />
    </>
  );
};
export default App;
