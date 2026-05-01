import React, {useRef, useCallback, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
const getChartHtml = require('./getChartHtml');

export default function AmCharts(props) {
  const {
    chartConfig,
    chartType,
    style,
    initialScale = 0.9,
    maximumScale = 0.9,
    themes = ['material', 'animated'],
    onReady,
  } = props;

  const webViewRef = useRef(null);
  const chartCreated = useRef(false);

  const html = getChartHtml(initialScale, maximumScale);

  const themeCode = themes
    .map((t) => `am4core.useTheme(am4themes_${t});`)
    .join('\n  ');

  const initScript = `
  (function() {
    try {
      ${themeCode}
      am4core.ready(function() {
        window.amChart = am4core.createFromConfig(
          ${JSON.stringify(chartConfig)},
          "chartdiv",
          am4charts.${chartType}
        );
        window.ReactNativeWebView.postMessage(JSON.stringify({type: "ready"}));
      });
    } catch(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type: "error", message: e.message}));
    }
  })();
  true;
  `;

  // Update chart data when chartConfig.data changes
  useEffect(() => {
    if (chartCreated.current && webViewRef.current && chartConfig.data) {
      const updateScript = `
        if(window.amChart) {
          window.amChart.data = ${JSON.stringify(chartConfig.data)};
        }
        true;
      `;
      webViewRef.current.injectJavaScript(updateScript);
    }
  }, [chartConfig.data]);

  const onMessage = useCallback(
    (event) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'ready') {
          chartCreated.current = true;
          onReady && onReady();
        }
      } catch (e) {
        // ignore non-JSON messages
      }
    },
    [onReady],
  );

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        style={styles.webView}
        source={{html}}
        originWhitelist={['*']}
        injectedJavaScript={initScript}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMessage}
        scrollEnabled={false}
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});
