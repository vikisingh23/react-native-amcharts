import type { RefObject } from 'react';
import type WebView from 'react-native-webview';
import type { BridgeMessageToWeb, BridgeMessageFromWeb } from './types';

let callId = 0;

export function postMessage(
  webViewRef: RefObject<WebView | null>,
  msg: BridgeMessageToWeb,
) {
  webViewRef.current?.postMessage(JSON.stringify(msg));
}

export function nextCallId(): string {
  return `c_${++callId}_${Date.now()}`;
}

export function parseMessage(data: string): BridgeMessageFromWeb | null {
  try {
    return JSON.parse(data) as BridgeMessageFromWeb;
  } catch {
    return null;
  }
}
