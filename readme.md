# React Native AmCharts v2

TypeScript wrapper for [AmCharts 4](https://www.amcharts.com/) in React Native with a bidirectional bridge, smart config updates, and imperative API.

## Features

- **TypeScript** — Full type definitions for props, config, and events
- **Bidirectional bridge** — Call chart methods from RN, receive events back
- **Smart updates** — Diffs config changes; sends data-only updates when possible
- **Selective script loading** — Only loads the amcharts modules your chart type needs
- **Imperative API** — `ref` to call methods, export images, update data
- **Error boundaries** — Custom `renderError` and `renderLoading` components
- **Lightweight** — Scripts from CDN, ~3KB package size

## Installation

```bash
npm install react-native-amcharts react-native-webview
```

## Basic Usage

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ReactNativeAmChart } from 'react-native-amcharts';

const config = {
  series: [{
    type: 'PieSeries',
    dataFields: { value: 'litres', category: 'country' },
  }],
  data: [
    { country: 'Lithuania', litres: 501.9 },
    { country: 'Germany', litres: 165.8 },
    { country: 'Australia', litres: 139.9 },
  ],
  legend: {},
};

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <ReactNativeAmChart
        chartConfig={config}
        chartType="PieChart"
        style={{ height: 400 }}
        onReady={() => console.log('Chart ready')}
      />
    </View>
  );
}
```

## Imperative API (ref)

```tsx
import React, { useRef } from 'react';
import { ReactNativeAmChart, ChartHandle } from 'react-native-amcharts';

function Dashboard() {
  const chartRef = useRef<ChartHandle>(null);

  const zoomIn = async () => {
    await chartRef.current?.call('xAxes.getIndex(0).zoomToIndexes', 0, 5);
  };

  const updateData = () => {
    chartRef.current?.setData([
      { country: 'Lithuania', litres: 600 },
      { country: 'Germany', litres: 200 },
    ]);
  };

  return (
    <>
      <ReactNativeAmChart
        ref={chartRef}
        chartConfig={config}
        chartType="XYChart"
        style={{ height: 400 }}
      />
      <Button title="Zoom" onPress={zoomIn} />
      <Button title="Update" onPress={updateData} />
    </>
  );
}
```

## Smart Updates

The component automatically detects what changed in your config:

| Change | Action |
|--------|--------|
| Only `data` changed | Sends `updateData` (no chart rebuild) |
| Other config keys changed | Sends `updateConfig` patch |
| `chartType` changed | Full chart re-initialization |

```tsx
// Only data changes → chart updates smoothly without flickering
const [data, setData] = useState(initialData);

<ReactNativeAmChart
  chartConfig={{ ...config, data }}
  chartType="XYChart"
  style={{ height: 400 }}
/>
```

## Error & Loading States

```tsx
<ReactNativeAmChart
  chartConfig={config}
  chartType="PieChart"
  renderLoading={() => <MySkeletonLoader />}
  renderError={(msg) => <Text>Chart error: {msg}</Text>}
  onError={(msg) => logToSentry(msg)}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chartConfig` | `ChartConfig` | **required** | AmCharts 4 JSON config |
| `chartType` | `ChartType` | **required** | `'PieChart'`, `'XYChart'`, `'MapChart'`, etc. |
| `style` | `ViewStyle` | — | Container style |
| `themes` | `AmTheme[]` | `['animated', 'material']` | Themes to apply |
| `initialScale` | `number` | `1` | Viewport initial scale |
| `maximumScale` | `number` | `1` | Viewport max scale |
| `cdnBase` | `string` | `https://cdn.amcharts.com/lib/4` | Custom CDN URL |
| `extraScripts` | `string[]` | `[]` | Additional script URLs |
| `onReady` | `() => void` | — | Chart ready callback |
| `onError` | `(msg: string) => void` | — | Error callback |
| `onEvent` | `(event: ChartEvent) => void` | — | Chart event handler |
| `renderLoading` | `() => ReactElement` | `ActivityIndicator` | Custom loader |
| `renderError` | `(msg: string) => ReactElement` | — | Custom error view |

## ChartHandle (ref methods)

| Method | Description |
|--------|-------------|
| `call(method, ...args)` | Call any chart method (returns Promise) |
| `setData(data)` | Replace chart data |
| `updateConfig(patch)` | Patch chart config |
| `dispose()` | Dispose the chart |
| `injectScript(js)` | Run raw JS in WebView |

## Requirements

- React Native >= 0.60
- react-native-webview >= 11
- Internet connection (CDN)

## License

MIT
