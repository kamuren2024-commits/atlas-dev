/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - WebSocket Handler
 * 
 * Manages WebSocket connections for real-time event delivery
 */

import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { CanonicalEvent, EventFilter } from './types';
import { EventBus } from './event-bus';

/**
 * WebSocket Client Connection
 */
interface WebSocketClient {
  id: string;
  ws: WebSocket;
  subscriptionId: string | null;
  filter: EventFilter | null;
  connectedAt: string;
  messageCount: number;
  lastMessageTime?: string;
}

/**
 * WebSocket Handler
 */
export class WebSocketHandler {
  private static instance: WebSocketHandler | null = null;
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private eventBus: EventBus;

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): WebSocketHandler {
    if (!WebSocketHandler.instance) {
      WebSocketHandler.instance = new WebSocketHandler();
    }
    return WebSocketHandler.instance;
  }

  /**
   * Initialize WebSocket server
   */
  public initialize(httpServer: HTTPServer, path: string = '/ws'): WebSocketServer {
    if (this.wss) {
      return this.wss;
    }

    console.log(`[WEBSOCKET-HANDLER] Initializing WebSocket server on ${path}...`);

    this.wss = new WebSocketServer({ server: httpServer, path });

    this.wss.on('connection', (ws) => this.handleConnection(ws));

    console.log(`[WEBSOCKET-HANDLER] WebSocket server ready`);

    return this.wss;
  }

  /**
   * Get connected clients count
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get client info
   */
  public getClientInfo(clientId: string): WebSocketClient | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Get all clients
   */
  public getAllClients(): WebSocketClient[] {
    return Array.from(this.clients.values());
  }

  /**
   * Broadcast event to all clients
   */
  public broadcastEvent(event: CanonicalEvent): void {
    const payload = JSON.stringify({
      type: 'event',
      data: event,
      timestamp: new Date().toISOString(),
    });

    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload, (error) => {
          if (error) {
            console.warn(`[WEBSOCKET-HANDLER] Send error to ${client.id}:`, error);
          }
        });
      }
    }
  }

  /**
   * Send event to specific client
   */
  public sendToClient(clientId: string, event: CanonicalEvent): void {
    const client = this.clients.get(clientId);

    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = JSON.stringify({
      type: 'event',
      data: event,
      timestamp: new Date().toISOString(),
    });

    client.ws.send(payload, (error) => {
      if (error) {
        console.warn(`[WEBSOCKET-HANDLER] Send error to ${clientId}:`, error);
      }
    });
  }

  /**
   * Disconnect client
   */
  public disconnectClient(clientId: string): void {
    const client = this.clients.get(clientId);

    if (client) {
      if (client.subscriptionId) {
        this.eventBus.unsubscribe(client.subscriptionId);
      }

      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close(1000, 'Server disconnect');
      }

      this.clients.delete(clientId);

      console.log(`[WEBSOCKET-HANDLER] Client disconnected: ${clientId}`);
    }
  }

  /**
   * Broadcast status update
   */
  public broadcastStatus(status: Record<string, any>): void {
    const payload = JSON.stringify({
      type: 'status',
      data: status,
      timestamp: new Date().toISOString(),
    });

    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }

  /**
   * Shutdown handler
   */
  public async shutdown(): Promise<void> {
    console.log('[WEBSOCKET-HANDLER] Shutting down WebSocket server...');

    // Close all client connections
    for (const clientId of Array.from(this.clients.keys())) {
      this.disconnectClient(clientId);
    }

    // Close server
    if (this.wss) {
      this.wss.close();
    }

    this.wss = null;

    console.log('[WEBSOCKET-HANDLER] WebSocket server shut down');
  }

  /**
   * Private: Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket): void {
    const clientId = uuidv4();

    const client: WebSocketClient = {
      id: clientId,
      ws,
      subscriptionId: null,
      filter: null,
      connectedAt: new Date().toISOString(),
      messageCount: 0,
    };

    this.clients.set(clientId, client);

    console.log(`[WEBSOCKET-HANDLER] Client connected: ${clientId}`);

    // Send welcome message
    this.sendToClient(clientId, {
      id: uuidv4(),
      eventType: 'SYSTEM_WELCOME',
      category: 'TELEMETRY',
      timestamp: new Date().toISOString(),
      sourceId: 'SYSTEM',
      severity: 'INFO',
      status: 'PENDING',
      tags: ['system'],
      metadata: {
        clientId,
        message: 'Connected to KETRACO Command Center event fabric',
      },
    } as any);

    // Handle messages
    ws.on('message', (data) => this.handleMessage(clientId, data));

    // Handle close
    ws.on('close', () => this.handleClose(clientId));

    // Handle error
    ws.on('error', (error) => this.handleError(clientId, error));

    // Send ping every 30 seconds
    const pingInterval = setInterval(() => {
      if (client.ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  }

  /**
   * Private: Handle incoming message
   */
  private handleMessage(clientId: string, data: any): void {
    const client = this.clients.get(clientId);

    if (!client) return;

    client.messageCount += 1;
    client.lastMessageTime = new Date().toISOString();

    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(clientId, message.filter);
          break;

        case 'unsubscribe':
          this.handleUnsubscribe(clientId);
          break;

        case 'ping':
          this.sendToClient(clientId, {
            id: uuidv4(),
            eventType: 'SYSTEM_PONG',
            category: 'TELEMETRY',
            timestamp: new Date().toISOString(),
            sourceId: 'SYSTEM',
            severity: 'INFO',
            status: 'PENDING',
            tags: ['system'],
            metadata: { sequenceNumber: message.sequence },
          } as any);
          break;

        case 'query_stats':
          this.sendStats(clientId);
          break;

        case 'query_state':
          this.sendState(clientId);
          break;

        default:
          console.warn(`[WEBSOCKET-HANDLER] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.warn(`[WEBSOCKET-HANDLER] Message parse error for ${clientId}:`, error);
    }
  }

  /**
   * Private: Handle subscription
   */
  private handleSubscribe(clientId: string, filter: EventFilter): void {
    const client = this.clients.get(clientId);

    if (!client) return;

    // Unsubscribe from previous if exists
    if (client.subscriptionId) {
      this.eventBus.unsubscribe(client.subscriptionId);
    }

    // Subscribe with filter
    client.filter = filter;
    client.subscriptionId = this.eventBus.subscribe(
      filter,
      async (event) => {
        this.sendToClient(clientId, event);
      }
    );

    // Send confirmation
    this.sendToClient(clientId, {
      id: uuidv4(),
      eventType: 'SYSTEM_SUBSCRIBED',
      category: 'TELEMETRY',
      timestamp: new Date().toISOString(),
      sourceId: 'SYSTEM',
      severity: 'INFO',
      status: 'PENDING',
      tags: ['system'],
      metadata: {
        subscriptionId: client.subscriptionId,
        filter,
      },
    } as any);

    console.log(
      `[WEBSOCKET-HANDLER] Client ${clientId} subscribed to ${
        filter.categories?.join(', ') || 'all'
      }`
    );
  }

  /**
   * Private: Handle unsubscribe
   */
  private handleUnsubscribe(clientId: string): void {
    const client = this.clients.get(clientId);

    if (!client || !client.subscriptionId) return;

    this.eventBus.unsubscribe(client.subscriptionId);
    client.subscriptionId = null;
    client.filter = null;

    // Send confirmation
    this.sendToClient(clientId, {
      id: uuidv4(),
      eventType: 'SYSTEM_UNSUBSCRIBED',
      category: 'TELEMETRY',
      timestamp: new Date().toISOString(),
      sourceId: 'SYSTEM',
      severity: 'INFO',
      status: 'PENDING',
      tags: ['system'],
      metadata: {},
    } as any);

    console.log(`[WEBSOCKET-HANDLER] Client ${clientId} unsubscribed`);
  }

  /**
   * Private: Send stats to client
   */
  private sendStats(clientId: string): void {
    const stats = this.eventBus.getStatistics();

    this.sendToClient(clientId, {
      id: uuidv4(),
      eventType: 'SYSTEM_STATS',
      category: 'TELEMETRY',
      timestamp: new Date().toISOString(),
      sourceId: 'SYSTEM',
      severity: 'INFO',
      status: 'PENDING',
      tags: ['system', 'stats'],
      metadata: stats,
    } as any);
  }

  /**
   * Private: Send state to client
   */
  private sendState(clientId: string): void {
    const EventStateStore = require('./state-store').EventStateStore;
    const stateStore = EventStateStore.getInstance();

    const state = {
      global: stateStore.getGlobalState(),
      summary: stateStore.getStateSummary(),
    };

    this.sendToClient(clientId, {
      id: uuidv4(),
      eventType: 'SYSTEM_STATE',
      category: 'TELEMETRY',
      timestamp: new Date().toISOString(),
      sourceId: 'SYSTEM',
      severity: 'INFO',
      status: 'PENDING',
      tags: ['system', 'state'],
      metadata: state,
    } as any);
  }

  /**
   * Private: Handle close
   */
  private handleClose(clientId: string): void {
    const client = this.clients.get(clientId);

    if (client && client.subscriptionId) {
      this.eventBus.unsubscribe(client.subscriptionId);
    }

    this.clients.delete(clientId);

    console.log(`[WEBSOCKET-HANDLER] Client disconnected: ${clientId}`);
  }

  /**
   * Private: Handle error
   */
  private handleError(clientId: string, error: Error): void {
    console.error(`[WEBSOCKET-HANDLER] Client ${clientId} error:`, error);

    this.disconnectClient(clientId);
  }
}

export default WebSocketHandler;
