import type { ViewStyle } from 'react-native';

// ── Chart types ──────────────────────────────────────────────────────

export type ChartType =
  | 'PieChart'
  | 'XYChart'
  | 'MapChart'
  | 'RadarChart'
  | 'TreeMap'
  | 'SankeyDiagram'
  | 'ChordDiagram'
  | 'FlowDiagram'
  | 'SlicedChart'
  | 'GaugeChart'
  | (string & {}); // allow any string for forward compat

export type AmTheme =
  | 'animated'
  | 'material'
  | 'dark'
  | 'frozen'
  | 'dataviz'
  | 'moonrisekingdom'
  | 'spiritedaway'
  | 'kelly'
  | (string & {});

export type AmChartsVersion = 4 | 5;

// ── Chart config (v4: JSON config, v5: imperative setup script) ─────

export interface ChartConfig {
  data?: Record<string, unknown>[];
  series?: Record<string, unknown>[];
  xAxes?: Record<string, unknown>[];
  yAxes?: Record<string, unknown>[];
  legend?: Record<string, unknown>;
  cursor?: Record<string, unknown>;
  scrollbarX?: Record<string, unknown>;
  scrollbarY?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * For amcharts 5: a JS string that creates the chart imperatively.
 * Available variables in scope: `root` (am5.Root), `am5`, `am5xy`, `am5percent`, `am5map`, etc.
 * Must assign the chart to `window.chart`.
 *
 * Example:
 * ```
 * var chart = root.container.children.push(am5percent.PieChart.new(root, {}));
 * var series = chart.series.push(am5percent.PieSeries.new(root, {
 *   valueField: "value", categoryField: "category"
 * }));
 * series.data.setAll([{category: "A", value: 10}]);
 * window.chart = chart;
 * ```
 */
export type ChartSetupScript = string;

// ── Bridge messages (RN ↔ WebView) ──────────────────────────────────

export type BridgeMessageToWeb =
  | { type: 'init'; config: ChartConfig; chartType: ChartType; themes: AmTheme[] }
  | { type: 'initV5'; script: ChartSetupScript; themes: AmTheme[] }
  | { type: 'updateData'; data: Record<string, unknown>[] }
  | { type: 'updateConfig'; patch: Partial<ChartConfig> }
  | { type: 'call'; id: string; method: string; args: unknown[] }
  | { type: 'dispose' };

export type BridgeMessageFromWeb =
  | { type: 'ready' }
  | { type: 'error'; message: string }
  | { type: 'event'; name: string; data: unknown }
  | { type: 'callResult'; id: string; result: unknown }
  | { type: 'callError'; id: string; message: string };

// ── Chart event handler ─────────────────────────────────────────────

export interface ChartEvent {
  name: string;
  data: unknown;
}

// ── Imperative handle exposed via ref ───────────────────────────────

export interface ChartHandle {
  /** Call any method on the chart instance */
  call: (method: string, ...args: unknown[]) => Promise<unknown>;
  /** Replace chart data (v4: chart.data, v5: first series data) */
  setData: (data: Record<string, unknown>[]) => void;
  /** Patch chart config (v4 only — for v5 use injectScript) */
  updateConfig: (patch: Partial<ChartConfig>) => void;
  /** Dispose the chart */
  dispose: () => void;
  /** Inject raw JS into the WebView */
  injectScript: (js: string) => void;
}

// ── Component props ─────────────────────────────────────────────────

export interface AmChartProps {
  /** amcharts version: 4 (default) or 5 */
  version?: AmChartsVersion;
  /** v4: JSON config object. v5: ignored if setupScript is provided */
  chartConfig?: ChartConfig;
  /** v4: chart type string. v5: ignored if setupScript is provided */
  chartType?: ChartType;
  /**
   * v5 only: imperative JS that creates the chart.
   * Available globals: root, am5, am5xy, am5percent, am5map, am5radar, am5hierarchy, am5flow, am5wc.
   * Must assign chart to `window.chart`.
   */
  setupScript?: ChartSetupScript;
  style?: ViewStyle;
  /** Themes to apply (default: ['Animated'] for v5, ['animated', 'material'] for v4) */
  themes?: AmTheme[];
  /** Viewport initial scale (default: 1) */
  initialScale?: number;
  /** Viewport maximum scale (default: 1) */
  maximumScale?: number;
  /** Custom CDN base URL */
  cdnBase?: string;
  /** Extra script URLs to load (e.g. geodata, plugins) */
  extraScripts?: string[];
  /** Chart events to subscribe to */
  onEvent?: (event: ChartEvent) => void;
  /** Called when chart is ready */
  onReady?: () => void;
  /** Called on chart error */
  onError?: (message: string) => void;
  /** Custom loading component */
  renderLoading?: () => React.ReactElement;
  /** Custom error component */
  renderError?: (message: string) => React.ReactElement;
}
