import React, {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import type { AmChartProps, ChartHandle, BridgeMessageFromWeb } from './types';
import { buildChartHtml } from './html/template';
import { parseMessage } from './bridge';
import { useChartBridge } from './hooks/useChartBridge';
import { useSmartUpdate } from './hooks/useSmartUpdate';

const CDN_DEFAULT = 'https://cdn.amcharts.com/lib/4';

const AmChart = forwardRef<ChartHandle, AmChartProps>(function AmChart(
  props,
  ref,
) {
  const {
    chartConfig,
    chartType,
    style,
    themes = ['animated', 'material'],
    initialScale = 1,
    maximumScale = 1,
    cdnBase = CDN_DEFAULT,
    extraScripts = [],
    onEvent,
    onReady,
    onError,
    renderLoading,
    renderError,
  } = props;

  const webViewRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { resolveCall, rejectCall } = useChartBridge(webViewRef, ref);

  // Smart updates: diffs config and sends minimal messages
  useSmartUpdate(webViewRef, chartConfig, chartType, themes, ready);

  const html = buildChartHtml({
    chartType,
    themes,
    initialScale,
    maximumScale,
    cdnBase,
    extraScripts,
  });

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({ type: 'dispose' }));
      }
    };
  }, []);

  // Error state
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
