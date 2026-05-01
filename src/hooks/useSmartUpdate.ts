import { useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import type { ChartConfig, ChartType, AmTheme } from '../types';
import { postMessage } from '../bridge';

/** Shallow compare two values — returns true if different */
function changed(a: unknown, b: unknown): boolean {
  if (a === b) return false;
  if (typeof a !== typeof b) return true;
  if (typeof a !== 'object' || a === null || b === null) return true;
  return JSON.stringify(a) !== JSON.stringify(b);
}

/**
 * Watches chartConfig and sends minimal updates to the WebView.
 * Full re-init only when chartType changes.
 */
export function useSmartUpdate(
  webViewRef: RefObject<WebView | null>,
  chartConfig: ChartConfig,
  chartType: ChartType,
  themes: AmTheme[],
  ready: boolean,
) {
  const prevConfig = useRef<ChartConfig | null>(null);
  const prevType = useRef<ChartType | null>(null);
  const initialized = useRef(false);

  // Full init on first ready or chartType change
  useEffect(() => {
    if (!ready) return;

    if (!initialized.current || prevType.current !== chartType) {
      postMessage(webViewRef, {
        type: 'init',
        config: chartConfig,
        chartType,
        themes,
      });
      initialized.current = true;
      prevType.current = chartType;
      prevConfig.current = chartConfig;
      return;
    }

    // Smart diff: only send what changed
    const prev = prevConfig.current;
    if (!prev) return;

    // Data-only change (most common case)
    if (changed(prev.data, chartConfig.data) && !changed(excludeKey(prev, 'data'), excludeKey(chartConfig, 'data'))) {
      if (chartConfig.data) {
        postMessage(webViewRef, { type: 'updateData', data: chartConfig.data });
      }
    } else if (changed(prev, chartConfig)) {
      // Other config changed — send patch of changed keys
      const patch: Partial<ChartConfig> = {};
      for (const key of Object.keys(chartConfig)) {
        if (changed((prev as Record<string, unknown>)[key], (chartConfig as Record<string, unknown>)[key])) {
          (patch as Record<string, unknown>)[key] = (chartConfig as Record<string, unknown>)[key];
        }
      }
      if (Object.keys(patch).length > 0) {
        postMessage(webViewRef, { type: 'updateConfig', patch });
      }
    }

    prevConfig.current = chartConfig;
  }, [webViewRef, chartConfig, chartType, themes, ready]);
}

function excludeKey(obj: Record<string, unknown>, key: string): Record<string, unknown> {
  const { [key]: _, ...rest } = obj;
  return rest;
}
