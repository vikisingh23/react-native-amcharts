# React Native AmCharts

Unofficial React Native wrapper for [AmCharts 4](https://www.amcharts.com/) using [JSON-based Config](https://www.amcharts.com/docs/v4/concepts/json-config/).

## Features

- AmCharts 4 via JSON config — no native code required
- Works on iOS and Android
- Dynamic data updates
- Lightweight — scripts loaded from CDN (no bundled 43K-line HTML)
- Compatible with React Native 0.60+ and react-native-webview 11+

## Installation

```bash
npm install react-native-amcharts react-native-webview
```

For React Native 0.60+, WebView auto-links. For older versions:

```bash
react-native link react-native-webview
```

## Usage

```jsx
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ReactNativeAmChart} from 'react-native-amcharts';

const config = {
  series: [
    {
      type: 'PieSeries',
      dataFields: {value: 'litres', category: 'country'},
    },
  ],
  data: [
    {country: 'Lithuania', litres: 501.9},
    {country: 'Czech Republic', litres: 301.9},
    {country: 'Ireland', litres: 201.1},
    {country: 'Germany', litres: 165.8},
  ],
  legend: {},
};

export default function App() {
  return (
    <View style={styles.container}>
      <ReactNativeAmChart
        chartConfig={config}
        chartType="PieChart"
        style={styles.chart}
        onReady={() => console.log('Chart ready')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  chart: {height: '50%', width: '100%'},
});
```

## Dynamic Data

Update chart data by passing new `chartConfig.data`:

```jsx
const [data, setData] = React.useState(initialData);

<ReactNativeAmChart
  chartConfig={{...config, data}}
  chartType="XYChart"
  style={styles.chart}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chartConfig` | `object` | **required** | AmCharts 4 JSON config |
| `chartType` | `string` | **required** | Chart type (e.g. `PieChart`, `XYChart`) |
| `style` | `ViewStyle` | `{}` | Container style |
| `initialScale` | `number` | `0.9` | WebView initial viewport scale |
| `maximumScale` | `number` | `0.9` | WebView maximum viewport scale |
| `themes` | `string[]` | `['material', 'animated']` | AmCharts themes to apply |
| `onReady` | `function` | — | Called when chart finishes rendering |

## Supported Chart Types

Any AmCharts 4 chart type works: `PieChart`, `XYChart`, `MapChart`, `RadarChart`, `TreeMap`, `SankeyDiagram`, etc.

## Requirements

- React Native >= 0.60
- react-native-webview >= 11.0.0
- Internet connection (CDN scripts)

## License

MIT
