/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Server-Sent Events (SSE) Handler
 * 
 * Alternative to WebSocket for real-time event delivery
 * Browser-native, works through standard HTTP
 */

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CanonicalEvent, EventFilter } from './types';
import { EventBus } from './event-bus';

/**
 * SSE Client Connection
 */
interface SSEClient {
  id: string;
  response: Response;
  subscriptionId: string | null;
  filter: EventFilter | null;
  connectedAt: string;
  messageCount: number;
}

/**
 * SSE Handler
 */
export class SSEHandler {
  private static instance: SSEHandler | null = null;
  private clients: Map<string, SSEClient> = new Map();
  private eventBus: EventBus;
  private reconnectionTimeout = 5000; // 5 seconds

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): SSEHandler {
    if (!SSEHandler.instance) {
      SSEHandler.instance = new SSEHandler();
    }
    return SSEHandler.instance;
  }

  /**
   * Handle SSE connection
   */
  public handleConnection(res: Response): string {
    const clientId = uuidv4();

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const client: SSEClient = {
      id: clientId,
      response: res,
      subscriptionId: null,
      filter: null,
      connectedAt: new Date().toISOString(),
      messageCount: 0,
    };

    this.clients.set(clientId, client);

    console.log(`[SSE-HANDLER] Client connected: ${clientId}`);

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
        message: 'Connected to KETRACO Command Center event fabric via SSE',
      },
    } as any);

    // Send keep-alive ping every 30 seconds
    const pingInterval = setInterval(() => {
      if (!res.destroyed) {
        res.write(':ping\n\n');
      } else {
        clearInterval(pingInterval);
        this.disconnectClient(clientId);
      }
    }, 30000);

    // Handle client disconnect
    res.on('close', () => {
      clearInterval(pingInterval);
      this.handleDisconnect(clientId);
    });

    res.on('error', (error) => {
      console.warn(`[SSE-HANDLER] Client ${clientId} error:`, error);
      clearInterval(pingInterval);
      this.disconnectClient(clientId);
    });

    return clientId;
  }

  /**
   * Subscribe client to events
   */
  public subscribe(clientId: string, filter: EventFilter): void {
    const client = this.clients.get(clientId);

    if (!client) {
      throw new Error(`Client not found: ${clientId}`);
    }

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
      `[SSE-HANDLER] Client ${clientId} subscribed to ${
        filter.categories?.join(', ') || 'all'
      }`
    );
  }

  /**
   * Unsubscribe client from events
   */
  public unsubscribe(clientId: string): void {
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

    console.log(`[SSE-HANDLER] Client ${clientId} unsubscribed`);
  }

  /**
   * Send event to specific client
   */
  public sendToClient(clientId: string, event: CanonicalEvent): void {
    const client = this.clients.get(clientId);

    if (!client || client.response.destroyed) {
      return;
    }

    try {
      const eventType = event.eventType || 'event';
      const eventData = JSON.stringify(event);
      const eventId = event.id || uuidv4();

      // SSE format: id, event, data (newline separated), then double newline
      client.response.write(`id: ${eventId}\n`);
      client.response.write(`event: ${eventType}\n`);
      client.response.write(`data: ${eventData}\n\n`);

      client.messageCount += 1;
    } catch (error) {
      console.warn(`[SSE-HANDLER] Send error to ${clientId}:`, error);
      this.disconnectClient(clientId);
    }
  }

  /**
   * Broadcast event to all clients
   */
  public broadcastEvent(event: CanonicalEvent): void {
    for (const clientId of this.clients.keys()) {
      this.sendToClient(clientId, event);
    }
  }

  /**
   * Broadcast status to all clients
   */
  public broadcastStatus(status: Record<string, any>): void {
    const statusEvent: any = {
      id: uuidv4(),
      eventType: 'SYSTEM_STATUS',
      category: 'TELEMETRY',
      timestamp: new Date().toISOString(),
      sourceId: 'SYSTEM',
      severity: 'INFO',
      status: 'PENDING',
      tags: ['system', 'status'],
      metadata: status,
    };

    this.broadcastEvent(statusEvent);
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
  public getClientInfo(clientId: string): SSEClient | undefined {
    const client = this.clients.get(clientId);
    if (client) {
      return {
        ...client,
        response: undefined as any, // Don't expose response object
      };
    }
    return undefined;
  }

  /**
   * Get all clients
   */
  public getAllClients(): Partial<SSEClient>[] {
    return Array.from(this.clients.values()).map((c) => ({
      id: c.id,
      subscriptionId: c.subscriptionId,
      filter: c.filter,
      connectedAt: c.connectedAt,
      messageCount: c.messageCount,
    }));
  }

  /**
   * Disconnect specific client
   */
  public disconnectClient(clientId: string): void {
    const client = this.clients.get(clientId);

    if (client) {
      if (client.subscriptionId) {
        this.eventBus.unsubscribe(client.subscriptionId);
      }

      if (!client.response.destroyed) {
        client.response.end();
      }

      this.clients.delete(clientId);

      console.log(`[SSE-HANDLER] Client disconnected: ${clientId}`);
    }
  }

  /**
   * Disconnect all clients
   */
  public disconnectAllClients(): void {
    for (const clientId of Array.from(this.clients.keys())) {
      this.disconnectClient(clientId);
    }
  }

  /**
   * Private: Handle disconnect
   */
  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);

    if (client && client.subscriptionId) {
      this.eventBus.unsubscribe(client.subscriptionId);
    }

    this.clients.delete(clientId);

    console.log(`[SSE-HANDLER] Client disconnected: ${clientId}`);
  }

  /**
   * Shutdown handler
   */
  public async shutdown(): Promise<void> {
    console.log('[SSE-HANDLER] Shutting down SSE handler...');

    this.disconnectAllClients();

    console.log('[SSE-HANDLER] SSE handler shut down');
  }
}

export default SSEHandler;
