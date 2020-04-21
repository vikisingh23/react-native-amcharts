import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
const HtmlData = require('./scripts/index.html');

export default function AmCharts(props) {
  const chartData = JSON.stringify(props.chartConfig);
  const chartConfig = `
  am4core.useTheme(am4themes_material);
  am4core.useTheme(am4themes_animated);
  am4core.ready(function() {
    var amcoreChart = am4core.createFromConfig(${chartData},
    "chartdiv",
    am4charts.${props.chartType}
    )
  })
  `;
  return (
    <View style={[styles.loadingContiainer, {...props.style}]}>
      {/* {isLoading ? <ActivityIndicator style={styles.loadingIndicator} /> : null} */}
      <WebView
        style={styles.webView}
        source={HtmlData}
        startInLoadingState
        injectedJavaScript={chartConfig}
        javaScriptEnabled
        useWebKit
        onMessage={() => {
          console.log('');
        }}
        scalesPageToFit
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webView: {width: '100%', height: '100%'},
  loading: {
    width: 0,
    height: 0,
  },
  loadingIndicator: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loadingContiainer: {
    height: '100%',
    width: '100%',
  },
});
