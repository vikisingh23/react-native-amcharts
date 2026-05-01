import type { ChartType, AmTheme } from '../types';

const CDN_BASE = 'https://cdn.amcharts.com/lib/4';

/** Map chart types to required amcharts modules */
function getRequiredModules(chartType: ChartType): string[] {
  const modules = ['core'];
  const type = chartType.toLowerCase();
  if (type.includes('map')) {
    modules.push('maps');
  } else if (type.includes('wordcloud')) {
    modules.push('plugins/wordCloud');
  } else if (type.includes('timeline')) {
    modules.push('charts', 'plugins/timeline');
  } else if (type.includes('forceDirected')) {
    modules.push('charts', 'plugins/forceDirected');
  } else {
    modules.push('charts');
  }
  return modules;
}

interface HtmlOptions {
  chartType: ChartType;
  themes: AmTheme[];
  initialScale: number;
  maximumScale: number;
  cdnBase: string;
  extraScripts: string[];
}

export function buildChartHtml(options: HtmlOptions): string {
  const {
    chartType,
    themes,
    initialScale,
    maximumScale,
    cdnBase,
    extraScripts,
  } = options;

  const modules = getRequiredModules(chartType);
  const moduleScripts = modules
    .map((m) => `<script src="${cdnBase}/${m}.js"><\/script>`)
    .join('\n  ');

  const themeScripts = themes
    .map((t) => `<script src="${cdnBase}/themes/${t}.js"><\/script>`)
    .join('\n  ');

  const extraTags = extraScripts
    .map((url) => `<script src="${url}"><\/script>`)
    .join('\n  ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=${initialScale}, maximum-scale=${maximumScale}, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #chartdiv { width: 100%; height: 100%; overflow: hidden; }
  </style>
  ${moduleScripts}
  ${themeScripts}
  ${extraTags}
</head>
<body>
  <div id="chartdiv"></div>
  <script>
  (function() {
    var chart = null;
    var pendingCalls = {};

    function send(msg) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }

    function applyThemes(themes) {
      for (var i = 0; i < themes.length; i++) {
        var fn = window['am4themes_' + themes[i]];
        if (fn) am4core.useTheme(fn);
      }
    }

    function handleMessage(msg) {
      try {
        switch (msg.type) {
          case 'init':
            if (chart) { chart.dispose(); chart = null; }
            applyThemes(msg.themes);
            am4core.ready(function() {
              try {
                chart = am4core.createFromConfig(msg.config, 'chartdiv', am4charts[msg.chartType] || am4core[msg.chartType]);
                send({ type: 'ready' });
              } catch(e) {
                send({ type: 'error', message: e.message || String(e) });
              }
            });
            break;

          case 'updateData':
            if (chart) chart.data = msg.data;
            break;

          case 'updateConfig':
            if (chart) {
              var patch = msg.patch;
              for (var key in patch) {
                if (key === 'data') {
                  chart.data = patch.data;
                } else {
                  try { chart[key] = patch[key]; } catch(e) {}
                }
              }
            }
            break;

          case 'call':
            if (chart) {
              try {
                var parts = msg.method.split('.');
                var target = chart;
                for (var i = 0; i < parts.length - 1; i++) target = target[parts[i]];
                var result = target[parts[parts.length - 1]].apply(target, msg.args || []);
                send({ type: 'callResult', id: msg.id, result: result });
              } catch(e) {
                send({ type: 'callError', id: msg.id, message: e.message || String(e) });
              }
            }
            break;

          case 'dispose':
            if (chart) { chart.dispose(); chart = null; }
            break;
        }
      } catch(e) {
        send({ type: 'error', message: e.message || String(e) });
      }
    }

    // Bridge: receive messages from RN
    window.addEventListener('message', function(e) {
      try { handleMessage(JSON.parse(e.data)); } catch(err) {}
    });
    document.addEventListener('message', function(e) {
      try { handleMessage(JSON.parse(e.data)); } catch(err) {}
    });

    // Signal that the WebView bridge is ready
    send({ type: 'ready' });
  })();
  <\/script>
</body>
</html>`;
}
