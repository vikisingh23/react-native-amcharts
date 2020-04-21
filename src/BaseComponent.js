import React, {useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
const HtmlData = require('./scripts/index.html');

const htmlData = HtmlData;

export default function AmCharts(props) {
  const [isLoading, setIsLoading] = useState(true);

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
      {isLoading ? <ActivityIndicator style={styles.loadingIndicator} /> : null}
      <WebView
        style={styles.webView}
        source={htmlData}
        startInLoadingState
        onLoadEnd={() => setIsLoading(false)}
        injectedJavaScript={chartConfig}
        javaScriptEnabled
        useWebKit
        onMessage={message => {
          console.log('the url is', message);
        }}
        scalesPageToFit
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webView: {width: '100%', borderWidth: 1, height: '100%'},
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
    backgroundColor: '#ddd',
  },
});
