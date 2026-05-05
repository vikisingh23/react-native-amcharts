import React, {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import type { AmChartProps, ChartHandle } from './types';
import { buildChartHtml } from './html/template';
import { buildChartHtmlV5 } from './html/templateV5';
import { parseMessage } from './bridge';
import { useChartBridge } from './hooks/useChartBridge';
import { useSmartUpdate } from './hooks/useSmartUpdate';

const CDN_V4 = 'https://cdn.amcharts.com/lib/4';
const CDN_V5 = 'https://cdn.amcharts.com/lib/5';

const AmChart = forwardRef<ChartHandle, AmChartProps>(function AmChart(
  props,
  ref,
) {
  const {
    version = 4,
    chartConfig,
    chartType,
    setupScript,
    style,
    themes,
    initialScale = 1,
    maximumScale = 1,
    cdnBase,
    extraScripts = [],
    onEvent,
    onReady,
    onError,
    renderLoading,
    renderError,
  } = props;

  const resolvedCdn = cdnBase || (version === 5 ? CDN_V5 : CDN_V4);
  const resolvedThemes = themes || (version === 5 ? ['Animated'] : ['animated', 'material']);

  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { resolveCall, rejectCall } = useChartBridge(webViewRef, ref);

  useSmartUpdate(webViewRef, version, chartConfig, chartType, setupScript, resolvedThemes, ready);

  const html = useMemo(() => {
    if (version === 5) {
      return buildChartHtmlV5({
        themes: resolvedThemes,
        initialScale,
        maximumScale,
        cdnBase: resolvedCdn,
        extraScripts,
      });
    }
    return buildChartHtml({
      chartType: chartType || 'XYChart',
      themes: resolvedThemes,
      initialScale,
      maximumScale,
      cdnBase: resolvedCdn,
      extraScripts,
    });
  }, [version, resolvedCdn, resolvedThemes, initialScale, maximumScale, extraScripts, chartType]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const msg = parseMessage(event.nativeEvent.data);
      if (!msg) return;

      switch (msg.type) {
        case 'ready':
          setReady(true);
          setLoading(false);
          setError(null);
          onReady?.();
          break;
        case 'error':
          setError(msg.message);
          setLoading(false);
          onError?.(msg.message);
          break;
        case 'event':
          onEvent?.({ name: msg.name, data: msg.data });
          break;
        case 'callResult':
          resolveCall(msg.id, msg.result);
          break;
        case 'callError':
          rejectCall(msg.id, msg.message);
          break;
      }
    },
    [onReady, onError, onEvent, resolveCall, rejectCall],
  );

  useEffect(() => {
    return () => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({ type: 'dispose' }));
      }
    };
  }, []);

  if (error && renderError) {
    return <View style={[styles.container, style]}>{renderError(error)}</View>;
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        style={styles.webView}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onError={() => {
          setError('WebView failed to load');
          onError?.('WebView failed to load');
        }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          {renderLoading ? renderLoading() : <ActivityIndicator size="large" />}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default AmChart;
