/**
 * Returns the base HTML shell for the WebView.
 * amCharts 4 scripts are loaded from CDN to keep the package lightweight.
 */
module.exports = function getChartHtml(initialScale, maximumScale) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" id="scalingtag" content="width=device-width, initial-scale=${initialScale}, maximum-scale=${maximumScale}" />
  <style>
    * { margin: 0; padding: 0; }
    #chartdiv { width: 100%; height: 100vh; }
  </style>
  <script src="https://cdn.amcharts.com/lib/4/core.js"></script>
  <script src="https://cdn.amcharts.com/lib/4/charts.js"></script>
  <script src="https://cdn.amcharts.com/lib/4/themes/animated.js"></script>
  <script src="https://cdn.amcharts.com/lib/4/themes/material.js"></script>
</head>
<body>
  <div id="chartdiv"></div>
</body>
</html>`;
};
