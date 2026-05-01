import { useRef, useCallback, useImperativeHandle } from 'react';
import type { RefObject, Ref } from 'react';
import type WebView from 'react-native-webview';
import type { ChartHandle, ChartConfig } from '../types';
import { postMessage, nextCallId } from '../bridge';

type PendingCall = {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
};

export function useChartBridge(
  webViewRef: RefObject<WebView | null>,
  forwardedRef: Ref<ChartHandle>,
) {
  const pendingCalls = useRef<Map<string, PendingCall>>(new Map());

  const call = useCallback(
    (method: string, ...args: unknown[]): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        const id = nextCallId();
        pendingCalls.current.set(id, { resolve, reject });
        postMessage(webViewRef, { type: 'call', id, method, args });
        // Timeout after 10s
        setTimeout(() => {
          if (pendingCalls.current.has(id)) {
            pendingCalls.current.delete(id);
            reject(new Error(`Call to ${method} timed out`));
          }
        }, 10000);
      });
    },
    [webViewRef],
  );

  const setData = useCallback(
    (data: Record<string, unknown>[]) => {
      postMessage(webViewRef, { type: 'updateData', data });
    },
    [webViewRef],
  );

  const updateConfig = useCallback(
    (patch: Partial<ChartConfig>) => {
      postMessage(webViewRef, { type: 'updateConfig', patch });
    },
    [webViewRef],
  );

  const dispose = useCallback(() => {
    postMessage(webViewRef, { type: 'dispose' });
  }, [webViewRef]);

  const injectScript = useCallback(
    (js: string) => {
      webViewRef.current?.injectJavaScript(js + ';true;');
    },
    [webViewRef],
  );

  const resolveCall = useCallback((id: string, result: unknown) => {
    const pending = pendingCalls.current.get(id);
    if (pending) {
      pendingCalls.current.delete(id);
      pending.resolve(result);
    }
  }, []);

  const rejectCall = useCallback((id: string, message: string) => {
    const pending = pendingCalls.current.get(id);
    if (pending) {
      pendingCalls.current.delete(id);
      pending.reject(new Error(message));
    }
  }, []);

  useImperativeHandle(
    forwardedRef,
    () => ({ call, setData, updateConfig, dispose, injectScript }),
    [call, setData, updateConfig, dispose, injectScript],
  );

  return { resolveCall, rejectCall };
}
