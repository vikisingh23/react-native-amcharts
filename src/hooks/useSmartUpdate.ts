import { useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import type { ChartConfig, ChartType, AmTheme, AmChartsVersion, ChartSetupScript } from '../types';
import { postMessage } from '../bridge';

function changed(a: unknown, b: unknown): boolean {
  if (a === b) return false;
  if (typeof a !== typeof b) return true;
  if (typeof a !== 'object' || a === null || b === null) return true;
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function useSmartUpdate(
  webViewRef: RefObject<WebView | null>,
  version: AmChartsVersion,
  chartConfig: ChartConfig | undefined,
  chartType: ChartType | undefined,
  setupScript: ChartSetupScript | undefined,
  themes: AmTheme[],
  ready: boolean,
) {
  const prevConfig = useRef<ChartConfig | null>(null);
  const prevType = useRef<ChartType | null>(null);
  const prevScript = useRef<ChartSetupScript | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (version === 5) {
      // v5: re-init when setupScript changes
      if (!initialized.current || prevScript.current !== setupScript) {
        if (setupScript) {
          postMessage(webViewRef, { type: 'initV5', script: setupScript, themes });
        }
        initialized.current = true;
        prevScript.current = setupScript || null;
        prevConfig.current = chartConfig || null;
        return;
      }
      // v5 data-only update
      if (chartConfig?.data && changed(prevConfig.current?.data, chartConfig.data)) {
        postMessage(webViewRef, { type: 'updateData', data: chartConfig.data });
        prevConfig.current = chartConfig;
      }
      return;
    }

    // v4 logic (unchanged)
    if (!chartConfig || !chartType) return;

    if (!initialized.current || prevType.current !== chartType) {
      postMessage(webViewRef, { type: 'init', config: chartConfig, chartType, themes });
      initialized.current = true;
      prevType.current = chartType;
      prevConfig.current = chartConfig;
      return;
    }

    const prev = prevConfig.current;
    if (!prev) return;

    if (changed(prev.data, chartConfig.data) && !changed(excludeKey(prev, 'data'), excludeKey(chartConfig, 'data'))) {
      if (chartConfig.data) {
        postMessage(webViewRef, { type: 'updateData', data: chartConfig.data });
      }
    } else if (changed(prev, chartConfig)) {
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
  }, [webViewRef, version, chartConfig, chartType, setupScript, themes, ready]);
}

function excludeKey(obj: Record<string, unknown>, key: string): Record<string, unknown> {
  const { [key]: _, ...rest } = obj;
  return rest;
}
