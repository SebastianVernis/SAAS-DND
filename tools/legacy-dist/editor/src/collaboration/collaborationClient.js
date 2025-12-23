/**
 * Collaboration Client
 * 
 * Manages WebSocket connection and real-time collaboration features
 */

import { io } from 'socket.io-client';

class CollaborationClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.currentProjectId = null;
    this.currentUser = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.eventHandlers = new Map();
    
    // Connection state
    this.connectionState = 'disconnected'; // 'disconnected', 'connecting', 'connected', 'reconnecting'
  }

  /**
   * Initialize the collaboration client
   * @param {Object} options - Configuration options
   */
  initialize(options = {}) {
    const {
      serverUrl = 'http://localhost:3001',
      token = null,
      autoConnect = false
    } = options;

    this.serverUrl = serverUrl;
    this.token = token;

    if (autoConnect && token) {
      this.connect();
    }

    console.log('🔌 Collaboration client initialized');
  }

  /**
   * Connect to the Socket.io server
   */
  connect() {
    if (this.socket && this.connected) {
      console.log('⚠️  Already connected');
      return;
    }

    if (!this.token) {
      console.error('❌ Cannot connect: No authentication token provided');
      this.emit('error', { message: 'No authentication token' });
      return;
    }

    this.connectionState = 'connecting';
    this.emit('connection-state-change', { state: 'connecting' });

    console.log('🔌 Connecting to collaboration server...');

    this.socket = io(this.serverUrl, {
      auth: {
        token: this.token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.setupSocketListeners();
  }

  /**
   * Setup Socket.io event listeners
   */
  setupSocketListeners() {
    // Connection events
    this.socket.on('connect', () => {
      this.connected = true;
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      console.log('✅ Connected to collaboration server');
      this.emit('connected', { socketId: this.socket.id });
      this.emit('connection-state-change', { state: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      this.connectionState = 'disconnected';
      
      console.log('🔌 Disconnected from collaboration server:', reason);
      this.emit('disconnected', { reason });
      this.emit('connection-state-change', { state: 'disconnected' });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.emit('connection-error', { error: error.message });
      
      // Exponential backoff for reconnection
      this.reconnectAttempts++;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 5000);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.emit('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.connectionState = 'reconnecting';
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
      this.emit('reconnecting', { attemptNumber });
      this.emit('connection-state-change', { state: 'reconnecting', attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      this.emit('reconnect-failed');
    });

    // Collaboration events
    this.socket.on('user-joined', (data) => {
      console.log('👤 User joined:', data.user.userName);
      this.emit('user-joined', data);
    });

    this.socket.on('user-left', (data) => {
      console.log('👋 User left:', data.userId);
      this.emit('user-left', data);
    });

    this.socket.on('cursor-update', (data) => {
      this.emit('cursor-update', data);
    });

    this.socket.on('selection-update', (data) => {
      this.emit('selection-update', data);
    });

    this.socket.on('user-action', (data) => {
      this.emit('user-action', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Join a project room
   * @param {string} projectId - Project ID
   * @param {Object} userData - Additional user data
   * @returns {Promise<Object>} Join result
   */
  async joinRoom(projectId, userData = {}) {
    if (!this.connected) {
      throw new Error('Not connected to collaboration server');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('join-room', { projectId, userData }, (response) => {
        if (response.success) {
          this.currentProjectId = projectId;
          this.currentUser = response.user;
          
          console.log(`✅ Joined room: ${projectId}`);
          this.emit('room-joined', response);
          resolve(response);
        } else {
          console.error('❌ Failed to join room:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Leave the current room
   * @returns {Promise<Object>} Leave result
   */
  async leaveRoom() {
    if (!this.connected || !this.currentProjectId) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('leave-room', {}, (response) => {
        if (response.success) {
          const projectId = this.currentProjectId;
          this.currentProjectId = null;
          this.currentUser = null;
          
          console.log(`✅ Left room: ${projectId}`);
          this.emit('room-left', response);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Send cursor position update
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {boolean} visible - Cursor visibility
   */
  updateCursor(x, y, visible = true) {
    if (!this.connected || !this.currentProjectId) {
      return;
    }

    this.socket.emit('cursor-move', { x, y, visible });
  }

  /**
   * Send element selection update
   * @param {Array<string>} elementIds - Selected element IDs
   */
  updateSelection(elementIds) {
    if (!this.connected || !this.currentProjectId) {
      return;
    }

    this.socket.emit('element-select', { elementIds });
  }

  /**
   * Send user action
   * @param {string} action - Action type
   * @param {Object} data - Action data
   */
  sendAction(action, data) {
    if (!this.connected || !this.currentProjectId) {
      return;
    }

    this.socket.emit('user-action', { action, data });
  }

  /**
   * Get room information
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Room info
   */
  async getRoomInfo(projectId) {
    if (!this.connected) {
      throw new Error('Not connected to collaboration server');
    }

    return new Promise((resolve, reject) => {
      this.socket.emit('get-room-info', { projectId }, (response) => {
        if (response.success) {
          resolve(response.room);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Ping the server
   * @returns {Promise<Object>} Pong response
   */
  async ping() {
    if (!this.connected) {
      throw new Error('Not connected to collaboration server');
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      this.socket.emit('ping', (response) => {
        const latency = Date.now() - startTime;
        resolve({ ...response, latency });
      });
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.currentProjectId = null;
      this.currentUser = null;
      this.connectionState = 'disconnected';
      
      console.log('👋 Disconnected from collaboration server');
      this.emit('connection-state-change', { state: 'disconnected' });
    }
  }

  /**
   * Register an event handler
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Unregister an event handler
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   */
  off(event, handler) {
    if (!this.eventHandlers.has(event)) {
      return;
    }
    
    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit an event to registered handlers
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.eventHandlers.has(event)) {
      return;
    }
    
    const handlers = this.eventHandlers.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for '${event}':`, error);
      }
    });
  }

  /**
   * Get connection state
   * @returns {string} Connection state
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get current project ID
   * @returns {string|null} Project ID
   */
  getCurrentProjectId() {
    return this.currentProjectId;
  }

  /**
   * Get current user
   * @returns {Object|null} User data
   */
  getCurrentUser() {
    return this.currentUser;
  }
}

// Export singleton instance
export const collaborationClient = new CollaborationClient();

// Export class for testing
export { CollaborationClient };

export default collaborationClient;
