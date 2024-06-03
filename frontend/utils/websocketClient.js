class WebsocketClient extends EventDispatcher {
  // socket链接
  url = '';
  // socket实例
  socket = null;
  // 重连次数
  reconnectAttemps = 0;
  // 最大重连数
  maxReconnectAttemps = 5;
  // 重连间隔
  reconnectInterval = 10000;

  // 发送心跳数据间隔
  heartbeatInterval = 1000 * 30;
  // 计时器id
  heartbeatIntervalbeatTimer = null;
  // 彻底终止ws
  stopWs = false;

  constructor(url) {
    super();
    this.url = url;
  }

  // 消息发送
  send(message) {
    if(this.socket && this.socket.readyState === WebSocket.OPEN){
      this.socket.send(message);
    }else {
      console.log('[Websocket] 未连接');
    }
  }

  // 生命周期勾子
  onopen(callback) {
    this.addEventListener('open', callback)
  }
  onmessage(callback) {
    this.addEventListener('message', callback)
  }
  onclose(callback) {
    this.addEventListener('close', callback)
  }
  onerror(callback) {
    this.addEventListener('error', callback)
  }

  // 初始化连接
  connect() {
    if(this.reconnectAttemps === 0) {
      console.log(`[Websocket] 初始化连接中...`);
    }
    if(this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(this.url);

    // ws连接成功
    this.socket.onopen = event => {
      this.stopWs = false;
      // 重置重连尝试成功连接
      this.reconnectAttemps = 0;
      // 在连接成功时停止当前的心跳检测并重新启动
      this.startHeartbeat();
      console.log(`[on open] 连接成功，等待服务端推送...`);
      this.dispatchEvent('open', event);
    }

    this.socket.onmessage = event => {
      console.log(`[on message] 接收消息...`, event.data);
      this.dispatchEvent('message', event);
      this.startHeartbeat();
    }

    this.socket.onclose = event => {
      if(this.reconnectAttemps === 0) {
        console.log(`[on close] 连接断开...`);
      }
      if(!this.stopWs) {
        this.handleReconnect();
      }
      this.dispatchEvent('close', event);
    }
    
    this.socket.onerror = event => {
      if(this.reconnectAttemps === 0) {
        console.log(`[on error] 连接异常...`);
      }
      this.closeHeartbeat();
      this.dispatchEvent('error', event);
    }
  }

  // 断网重连逻辑
  handleReconnect() {
    if(this.reconnectAttemps < this.maxReconnectAttemps) {
      this.reconnectAttemps ++;
      console.log(`尝试重连...(${this.reconnectAttemps}/${this.maxReconnectAttemps})`);
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval);
    }else {
      this.closeHeartbeat();
      console.log(`最大重连失败，终止重连：${this.url}`);
    }
  }

  // 开始心跳检测 -> 定时发送心跳消息
  startHeartbeat() {
    if(this.stopWs) return;
    if(this.heartbeatIntervalbeatTimer) {
      this.closeHeartbeat();
    }

    this.heartbeatIntervalbeatTimer = setInterval(() => {
      if(this.socket) {
        this.socket.send(JSON.stringify({ type: 'heartBeat', data: {} }));
        console.log('[Websocket] 送心跳数据');
      }else {
        console.error('[Websocket] 未连接');
      }
    }, this.heartbeatInterval);
  }

  // 关闭心跳
  closeHeartbeat() {
    clearInterval(this.heartbeatIntervalbeatTimer);
    this.heartbeatIntervalbeatTimer = null;
  }

  // 关闭连接
  close() {
    if(this.socket) {
      this.stopWs = true;
      this.socket.close();
      this.socket = null;
      this.removeEventListener('open');
      this.removeEventListener('message');
      this.removeEventListener('close');
      this.removeEventListener('error');
    }
    this.closeHeartbeat();
  }
}

// export default WebsocketClient;