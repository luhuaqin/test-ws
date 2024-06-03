const Websocket = require("ws");

const wss = new Websocket.Server({ port: 3200 });

console.log("[服务器]：运行在http://localhost:3200");

wss.on("connection", (ws) => {
  ws.send(`[wensocket云端]您已经连接云端！数据推送中！`);
  let index = 1;
  const interval = setInterval(() => {
    ws.send(`[websocket]数据推送第${index++}次`);
  }, 1000 * 10);

  ws.on("close", () => {
    clearInterval(interval);
    console.log("[服务器]：关闭");
  })
})
