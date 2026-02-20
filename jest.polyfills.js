// MSW 2.x requires fetch API globals - polyfill for Jest/jsdom environment
// This file runs via setupFiles BEFORE the test environment is loaded

const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Web Streams API - required by undici v7+ before import
const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
global.TransformStream = TransformStream;

// Polyfill MessageChannel/MessagePort - required by undici v7+ before import
const { MessageChannel, MessagePort } = require('worker_threads');
global.MessageChannel = MessageChannel;
global.MessagePort = MessagePort;

// Polyfill fetch globals using undici (ships with Node.js 18+)
const { fetch, Headers, Request, Response, FormData } = require('undici');
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
global.FormData = FormData;

// Polyfill BroadcastChannel for MSW
class BroadcastChannelPolyfill {
  constructor(name) {
    this.name = name;
  }
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}
global.BroadcastChannel = BroadcastChannelPolyfill;
