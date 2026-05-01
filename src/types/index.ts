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

// ── Chart config (loose typing — amcharts4 JSON config is huge) ─────

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

// ── Bridge messages (RN ↔ WebView) ──────────────────────────────────

export type BridgeMessageToWeb =
  | { type: 'init'; config: ChartConfig; chartType: ChartType; themes: AmTheme[] }
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
  /** Replace chart data */
  setData: (data: Record<string, unknown>[]) => void;
  /** Patch chart config (smart merge) */
  updateConfig: (patch: Partial<ChartConfig>) => void;
  /** Dispose the chart */
  dispose: () => void;
  /** Inject raw JS into the WebView */
  injectScript: (js: string) => void;
}

// ── Component props ─────────────────────────────────────────────────

export interface AmChartProps {
  chartConfig: ChartConfig;
  chartType: ChartType;
  style?: ViewStyle;
  /** Themes to apply (default: ['animated', 'material']) */
  themes?: AmTheme[];
  /** Viewport initial scale (default: 1) */
  initialScale?: number;
  /** Viewport maximum scale (default: 1) */
  maximumScale?: number;
  /** Use bundled scripts instead of CDN (requires internet otherwise) */
  offline?: boolean;
  /** Custom CDN base URL (default: https://cdn.amcharts.com/lib/4) */
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
