// import WebsocketClient from "./utils/websocketClient";

const ws = new WebsocketClient('ws://localhost:3200');


// 连接
ws.connect();
// console.log(ws, ws.socket);
// 同原生方法
ws.onclose(() => {});
// 同原生方法
ws.onerror(() => {});
// 同原生方法
ws.onmessage(() => {
  // 同原生方法
  ws.send('自定义发送的数据')
});
// 同原生方法
ws.onopen(() => {});
