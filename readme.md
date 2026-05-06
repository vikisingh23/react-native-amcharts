# React Native AmCharts

TypeScript wrapper for [AmCharts](https://www.amcharts.com/) in React Native. Supports **both amcharts 4 and 5** with a bidirectional bridge, smart updates, and imperative API.

## Features

- **amcharts 4 + 5** — Single component, pick version via prop
- **TypeScript** — Full type definitions
- **Bidirectional bridge** — Call chart methods from RN, receive events back
- **Smart updates** — Diffs config; sends data-only updates when possible
- **Imperative API** — `ref` to call methods, update data, inject scripts
- **Error boundaries** — Custom `renderError` and `renderLoading`

## Installation

```bash
npm install react-native-amcharts5 react-native-webview
```

---

## amcharts 4 (JSON config)

```tsx
import { ReactNativeAmChart } from 'react-native-amcharts5';

const config = {
  series: [{
    type: 'PieSeries',
    dataFields: { value: 'litres', category: 'country' },
  }],
  data: [
    { country: 'Lithuania', litres: 501.9 },
    { country: 'Germany', litres: 165.8 },
  ],
  legend: {},
};

<ReactNativeAmChart
  version={4}
  chartConfig={config}
  chartType="PieChart"
  style={{ height: 400 }}
/>
```

---

## amcharts 5 (imperative script)

amcharts 5 has no JSON config API — charts are created imperatively. Pass a `setupScript` string:

```tsx
import { ReactNativeAmChart } from 'react-native-amcharts5';

const setup = `
  var chart = root.container.children.push(
    am5percent.PieChart.new(root, { layout: root.verticalLayout })
  );
  var series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: "value",
      categoryField: "category"
    })
  );
  series.data.setAll([
    { category: "Lithuania", value: 501.9 },
    { category: "Germany", value: 165.8 },
    { category: "Australia", value: 139.9 }
  ]);
  chart.appear(1000, 100);
  window.chart = chart;
`;

<ReactNativeAmChart
  version={5}
  setupScript={setup}
  style={{ height: 400 }}
  themes={['Animated']}
/>
```

### Available globals in setupScript

| Variable | Module |
|----------|--------|
| `root` | `am5.Root` instance (already created) |
| `am5` | Core |
| `am5xy` | XY charts |
| `am5percent` | Pie/Funnel/Pyramid |
| `am5map` | Maps |
| `am5radar` | Radar/Gauge |
| `am5hierarchy` | Tree/Sunburst/Pack |
| `am5flow` | Sankey/Chord |
| `am5wc` | WordCloud |

### Dynamic data (v5)

```tsx
const [data, setData] = useState(initialData);

<ReactNativeAmChart
  version={5}
  setupScript={setup}
  chartConfig={{ data }}  // pass data here for dynamic updates
  style={{ height: 400 }}
/>
```

When `chartConfig.data` changes, it calls `series.getIndex(0).data.setAll(newData)` on the first series.

---

## Imperative API (ref)

Works with both v4 and v5:

```tsx
import { useRef } from 'react';
import { ReactNativeAmChart, ChartHandle } from 'react-native-amcharts5';

function Dashboard() {
  const chartRef = useRef<ChartHandle>(null);

  return (
    <>
      <ReactNativeAmChart
        ref={chartRef}
        version={5}
        setupScript={setup}
        style={{ height: 400 }}
      />
      <Button title="Update" onPress={() => {
        chartRef.current?.setData([{ category: 'New', value: 999 }]);
      }} />
      <Button title="Custom JS" onPress={() => {
        chartRef.current?.injectScript(`
          chart.series.getIndex(0).slices.template.set("cornerRadius", 5);
        `);
      }} />
    </>
  );
}
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `version` | `4 \| 5` | `4` | amcharts version |
| `chartConfig` | `ChartConfig` | — | v4: JSON config. v5: optional (for dynamic data) |
| `chartType` | `string` | — | v4 only: `'PieChart'`, `'XYChart'`, etc. |
| `setupScript` | `string` | — | v5 only: imperative chart creation JS |
| `style` | `ViewStyle` | — | Container style |
| `themes` | `string[]` | v4: `['animated','material']`, v5: `['Animated']` | Themes |
| `cdnBase` | `string` | auto | Custom CDN URL |
| `extraScripts` | `string[]` | `[]` | Additional script URLs |
| `onReady` | `() => void` | — | Chart ready callback |
| `onError` | `(msg) => void` | — | Error callback |
| `onEvent` | `(event) => void` | — | Chart event handler |
| `renderLoading` | `() => Element` | `ActivityIndicator` | Custom loader |
| `renderError` | `(msg) => Element` | — | Custom error view |

## ChartHandle (ref)

| Method | Description |
|--------|-------------|
| `call(method, ...args)` | Call chart method (Promise) |
| `setData(data)` | Replace data (v4: chart.data, v5: first series) |
| `updateConfig(patch)` | Patch config (v4 only) |
| `dispose()` | Dispose chart |
| `injectScript(js)` | Run raw JS in WebView |

## Requirements

- React Native >= 0.60
- react-native-webview >= 11
- Internet connection (CDN)

## License

MIT
