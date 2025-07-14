class RealtimeClient {
  private ws: WebSocket | null = null;
  public isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private subscriptions: Map<string, Set<Function>> = new Map();
  private messageHandlers: Map<string, Function> = new Map();
  private connectionHandlers: Set<Function> = new Set();
  private errorHandlers: Set<Function> = new Set();
  private tenantId: string | null = null;
  private userId: string | null = null;
  private clientId: string | null = null;

  connect(url?: string | null): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    const wsUrl = url || this.getWebSocketUrl();
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('🔌 WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      this.isConnected = false;
      this.notifyConnectionHandlers('disconnected');
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyErrorHandlers(error);
    };
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_API_URL || window.location.host;
    return `${protocol}//${host.replace('http://', '').replace('https://', '')}`;
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  authenticate(tenantId: string, userId: string, token: string | null = null): void {
    this.tenantId = tenantId;
    this.userId = userId;

    if (this.isConnected) {
      this.send({
        type: 'authenticate',
        tenantId,
        userId,
        token
      });
    }
  }

  subscribe(channel: string, event: string, handler: Function): () => void {
    const subscriptionKey = `${channel}:${event}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    
    this.subscriptions.get(subscriptionKey)!.add(handler);

    if (this.isConnected) {
      this.send({
        type: 'subscribe',
        channel,
        event
      });
    }

    return () => this.unsubscribe(channel, event, handler);
  }

  unsubscribe(channel: string, event: string, handler: Function): void {
    const subscriptionKey = `${channel}:${event}`;
    const handlers = this.subscriptions.get(subscriptionKey);
    
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.subscriptions.delete(subscriptionKey);
        
        if (this.isConnected) {
          this.send({
            type: 'unsubscribe',
            channel,
            event
          });
        }
      }
    }
  }

  publish(channel: string, event: string, payload: any): void {
    if (this.isConnected) {
      this.send({
        type: 'publish',
        channel,
        event,
        payload
      });
    }
  }

  onConnect(handler: Function): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  onError(handler: Function): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  private handleMessage(message: any): void {
    const { type, channel, event, payload, data, error } = message;

    switch (type) {
      case 'connected':
        this.clientId = message.clientId;
        console.log('🔌 Connected with client ID:', this.clientId);
        break;

      case 'authenticated':
        console.log('🔐 Authenticated for tenant:', message.tenantId);
        break;

      case 'subscribed':
        console.log('📡 Subscribed to:', `${message.channel}:${message.event}`);
        break;

      case 'unsubscribed':
        console.log('📡 Unsubscribed from:', `${message.channel}:${message.event}`);
        break;

      case 'event':
      case 'broadcast':
      case 'database_change':
        this.handleEvent(channel, event, payload || data);
        break;

      case 'test':
        console.log('🧪 Test message received:', message.message);
        this.handleEvent('test', 'message', message);
        break;

      case 'error':
        console.error('WebSocket error:', error);
        this.notifyErrorHandlers(error);
        break;

      default:
        console.log('Unknown message type:', type, message);
    }
  }

  private handleEvent(channel: string, event: string, data: any): void {
    const subscriptionKey = `${channel}:${event}`;
    const handlers = this.subscriptions.get(subscriptionKey);
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  private notifyConnectionHandlers(status: string): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  private notifyErrorHandlers(error: any): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (error) {
        console.error('Error in error handler:', error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
    this.isConnected = false;
    this.subscriptions.clear();
    this.connectionHandlers.clear();
    this.errorHandlers.clear();
  }

  getStatus(): any {
    return {
      isConnected: this.isConnected,
      clientId: this.clientId,
      tenantId: this.tenantId,
      userId: this.userId,
      subscriptionCount: this.subscriptions.size
    };
  }
}

// Create a singleton instance
const realtimeClient = new RealtimeClient();

export default realtimeClient; 