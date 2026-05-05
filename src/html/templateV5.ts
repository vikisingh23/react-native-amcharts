import type { AmTheme } from '../types';

const CDN_V5 = 'https://cdn.amcharts.com/lib/5';

interface HtmlV5Options {
  themes: AmTheme[];
  initialScale: number;
  maximumScale: number;
  cdnBase: string;
  extraScripts: string[];
}

export function buildChartHtmlV5(options: HtmlV5Options): string {
  const { themes, initialScale, maximumScale, cdnBase, extraScripts } = options;

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
  <script src="${cdnBase}/index.js"><\/script>
  <script src="${cdnBase}/xy.js"><\/script>
  <script src="${cdnBase}/percent.js"><\/script>
  <script src="${cdnBase}/map.js"><\/script>
  <script src="${cdnBase}/radar.js"><\/script>
  <script src="${cdnBase}/hierarchy.js"><\/script>
  <script src="${cdnBase}/flow.js"><\/script>
  <script src="${cdnBase}/wc.js"><\/script>
  ${themes.map((t) => `<script src="${cdnBase}/themes/${t}.js"><\/script>`).join('\n  ')}
  ${extraTags}
</head>
<body>
  <div id="chartdiv"></div>
  <script>
  (function() {
    var root = null;
    var chart = null;

    function send(msg) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }

    function handleMessage(msg) {
      try {
        switch (msg.type) {
          case 'initV5':
            if (root) { root.dispose(); root = null; chart = null; }
            root = am5.Root.new("chartdiv");

            // Apply themes
            var themeInstances = [];
            for (var i = 0; i < msg.themes.length; i++) {
              var themeName = msg.themes[i];
              // am5 themes: am5themes_Animated, am5themes_Dark, etc.
              var themeNs = window['am5themes_' + themeName];
              if (themeNs && themeNs.new) {
                themeInstances.push(themeNs.new(root));
              }
            }
            if (themeInstances.length) {
              root.setThemes(themeInstances);
            }

            try {
              // Execute user's setup script with am5 modules in scope
              var fn = new Function('root', 'am5', 'am5xy', 'am5percent', 'am5map', 'am5radar', 'am5hierarchy', 'am5flow', 'am5wc', msg.script);
              fn(root, am5, window.am5xy || {}, window.am5percent || {}, window.am5map || {}, window.am5radar || {}, window.am5hierarchy || {}, window.am5flow || {}, window.am5wc || {});
              chart = window.chart || null;
              send({ type: 'ready' });
            } catch(e) {
              send({ type: 'error', message: e.message || String(e) });
            }
            break;

          case 'updateData':
            // v5: update first series data by default
            if (chart && chart.series && chart.series.length > 0) {
              chart.series.getIndex(0).data.setAll(msg.data);
            }
            break;

          case 'call':
            if (chart || root) {
              try {
                var target = chart || root;
                var parts = msg.method.split('.');
                for (var i = 0; i < parts.length - 1; i++) {
                  target = target[parts[i]];
                }
                var result = target[parts[parts.length - 1]].apply(target, msg.args || []);
                send({ type: 'callResult', id: msg.id, result: result != null ? String(result) : null });
              } catch(e) {
                send({ type: 'callError', id: msg.id, message: e.message || String(e) });
              }
            }
            break;

          case 'dispose':
            if (root) { root.dispose(); root = null; chart = null; }
            break;
        }
      } catch(e) {
        send({ type: 'error', message: e.message || String(e) });
      }
    }

    window.addEventListener('message', function(e) {
      try { handleMessage(JSON.parse(e.data)); } catch(err) {}
    });
    document.addEventListener('message', function(e) {
      try { handleMessage(JSON.parse(e.data)); } catch(err) {}
    });

    send({ type: 'ready' });
  })();
  <\/script>
</body>
</html>`;
}
