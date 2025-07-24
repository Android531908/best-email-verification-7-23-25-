import { EventEmitter } from '../../../utils/EventEmitter';

export interface WhiteboardElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'text' | 'freehand' | 'equation' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  content?: string;
  points?: Array<{ x: number; y: number }>;
  createdBy: string;
  createdAt: Date;
  lastModified?: Date;
  modifiedBy?: string;
}

export interface WhiteboardState {
  id: string;
  elements: WhiteboardElement[];
  version: number;
  lastModified: Date;
  collaborators: string[];
}

export interface WhiteboardCursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
  tool?: string;
}

export interface WhiteboardSession {
  id: string;
  meetingId: string;
  title: string;
  createdBy: string;
  createdAt: Date;
  participants: string[];
  isActive: boolean;
  permissions: {
    [userId: string]: {
      canDraw: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canExport: boolean;
    };
  };
}

export class WhiteboardService extends EventEmitter {
  private currentSession: WhiteboardSession | null = null;
  private whiteboardState: WhiteboardState | null = null;
  private websocket: WebSocket | null = null;
  private cursors: Map<string, WhiteboardCursor> = new Map();
  private undoStack: WhiteboardElement[][] = [];
  private redoStack: WhiteboardElement[][] = [];
  private maxHistorySize = 50;
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setupWebSocket();
    this.startAutoSave();
  }

  private setupWebSocket(): void {
    // In production, connect to your whiteboard signaling server
    if (process.env.NODE_ENV === 'production') {
      const wsUrl = 'wss://your-whiteboard-server.com/ws';
      
      try {
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
          console.log('Whiteboard WebSocket connected');
        };
        
        this.websocket.onmessage = (event) => {
          this.handleWebSocketMessage(JSON.parse(event.data));
        };
        
        this.websocket.onclose = () => {
          console.log('Whiteboard WebSocket disconnected, attempting to reconnect...');
          setTimeout(() => this.setupWebSocket(), 3000);
        };
        
        this.websocket.onerror = (error) => {
          console.error('Whiteboard WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to setup whiteboard WebSocket:', error);
      }
    } else {
      console.log('Using mock whiteboard signaling for development');
    }
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'element-added':
        this.handleRemoteElementAdded(message.element);
        break;
      case 'element-updated':
        this.handleRemoteElementUpdated(message.element);
        break;
      case 'element-deleted':
        this.handleRemoteElementDeleted(message.elementId);
        break;
      case 'cursor-moved':
        this.handleRemoteCursorMoved(message.cursor);
        break;
      case 'whiteboard-cleared':
        this.handleRemoteWhiteboardCleared();
        break;
      case 'participant-joined':
        this.handleParticipantJoined(message.participant);
        break;
      case 'participant-left':
        this.handleParticipantLeft(message.participantId);
        break;
      default:
        console.log('Unknown whiteboard message:', message);
    }
  }

  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      if (this.whiteboardState && this.currentSession) {
        this.saveWhiteboardState();
      }
    }, 30000); // Auto-save every 30 seconds
  }

  async createWhiteboardSession(meetingId: string, title: string, userId: string): Promise<string> {
    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      id: sessionId,
      meetingId,
      title,
      createdBy: userId,
      createdAt: new Date(),
      participants: [userId],
      isActive: true,
      permissions: {
        [userId]: {
          canDraw: true,
          canEdit: true,
          canDelete: true,
          canExport: true
        }
      }
    };

    this.whiteboardState = {
      id: sessionId,
      elements: [],
      version: 1,
      lastModified: new Date(),
      collaborators: [userId]
    };

    // Send session creation to server
    this.sendWebSocketMessage({
      type: 'create-session',
      session: this.currentSession,
      timestamp: Date.now()
    });

    return sessionId;
  }

  async joinWhiteboardSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      // In production, this would fetch session data from server
      // For demo, we'll simulate joining
      
      if (!this.currentSession) {
        // Create a mock session for demo
        this.currentSession = {
          id: sessionId,
          meetingId: 'demo-meeting',
          title: 'Collaborative Whiteboard',
          createdBy: 'host-user',
          createdAt: new Date(),
          participants: [userId],
          isActive: true,
          permissions: {
            [userId]: {
              canDraw: true,
              canEdit: true,
              canDelete: true,
              canExport: true
            }
          }
        };

        this.whiteboardState = {
          id: sessionId,
          elements: [],
          version: 1,
          lastModified: new Date(),
          collaborators: [userId]
        };
      }

      // Add user to participants if not already present
      if (!this.currentSession.participants.includes(userId)) {
        this.currentSession.participants.push(userId);
        this.whiteboardState?.collaborators.push(userId);
      }

      // Send join message
      this.sendWebSocketMessage({
        type: 'join-session',
        sessionId,
        userId,
        timestamp: Date.now()
      });

      this.emit('sessionJoined', { sessionId, userId });
      return true;
    } catch (error) {
      console.error('Failed to join whiteboard session:', error);
      return false;
    }
  }

  async leaveWhiteboardSession(userId: string): Promise<void> {
    if (!this.currentSession) return;

    // Remove user from participants
    this.currentSession.participants = this.currentSession.participants.filter(id => id !== userId);
    
    if (this.whiteboardState) {
      this.whiteboardState.collaborators = this.whiteboardState.collaborators.filter(id => id !== userId);
    }

    // Remove user's cursor
    this.cursors.delete(userId);

    // Send leave message
    this.sendWebSocketMessage({
      type: 'leave-session',
      sessionId: this.currentSession.id,
      userId,
      timestamp: Date.now()
    });

    // If no participants left, deactivate session
    if (this.currentSession.participants.length === 0) {
      this.currentSession.isActive = false;
      this.currentSession = null;
      this.whiteboardState = null;
    }

    this.emit('sessionLeft', { userId });
  }

  addElement(element: WhiteboardElement): void {
    if (!this.whiteboardState || !this.currentSession) return;

    // Add to local state
    this.whiteboardState.elements.push(element);
    this.whiteboardState.version++;
    this.whiteboardState.lastModified = new Date();

    // Save to undo stack
    this.saveToUndoStack();

    // Broadcast to other participants
    this.sendWebSocketMessage({
      type: 'element-added',
      element,
      sessionId: this.currentSession.id,
      timestamp: Date.now()
    });

    this.emit('elementAdded', element);
  }

  updateElement(elementId: string, updates: Partial<WhiteboardElement>): void {
    if (!this.whiteboardState || !this.currentSession) return;

    const elementIndex = this.whiteboardState.elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) return;

    // Update local state
    this.whiteboardState.elements[elementIndex] = {
      ...this.whiteboardState.elements[elementIndex],
      ...updates,
      lastModified: new Date()
    };
    this.whiteboardState.version++;
    this.whiteboardState.lastModified = new Date();

    // Save to undo stack
    this.saveToUndoStack();

    // Broadcast to other participants
    this.sendWebSocketMessage({
      type: 'element-updated',
      elementId,
      updates,
      sessionId: this.currentSession.id,
      timestamp: Date.now()
    });

    this.emit('elementUpdated', { elementId, updates });
  }

  deleteElement(elementId: string): void {
    if (!this.whiteboardState || !this.currentSession) return;

    // Save to undo stack before deletion
    this.saveToUndoStack();

    // Remove from local state
    this.whiteboardState.elements = this.whiteboardState.elements.filter(el => el.id !== elementId);
    this.whiteboardState.version++;
    this.whiteboardState.lastModified = new Date();

    // Broadcast to other participants
    this.sendWebSocketMessage({
      type: 'element-deleted',
      elementId,
      sessionId: this.currentSession.id,
      timestamp: Date.now()
    });

    this.emit('elementDeleted', elementId);
  }

  clearWhiteboard(): void {
    if (!this.whiteboardState || !this.currentSession) return;

    // Save to undo stack before clearing
    this.saveToUndoStack();

    // Clear local state
    this.whiteboardState.elements = [];
    this.whiteboardState.version++;
    this.whiteboardState.lastModified = new Date();

    // Broadcast to other participants
    this.sendWebSocketMessage({
      type: 'whiteboard-cleared',
      sessionId: this.currentSession.id,
      timestamp: Date.now()
    });

    this.emit('whiteboardCleared');
  }

  updateCursor(userId: string, cursor: WhiteboardCursor): void {
    this.cursors.set(userId, cursor);

    // Broadcast cursor position to other participants
    this.sendWebSocketMessage({
      type: 'cursor-moved',
      cursor,
      sessionId: this.currentSession?.id,
      timestamp: Date.now()
    });

    this.emit('cursorMoved', cursor);
  }

  undo(): boolean {
    if (this.undoStack.length === 0 || !this.whiteboardState) return false;

    // Save current state to redo stack
    this.redoStack.push([...this.whiteboardState.elements]);

    // Restore previous state
    const previousState = this.undoStack.pop();
    if (previousState) {
      this.whiteboardState.elements = [...previousState];
      this.whiteboardState.version++;
      this.whiteboardState.lastModified = new Date();

      this.emit('stateRestored', this.whiteboardState.elements);
      return true;
    }

    return false;
  }

  redo(): boolean {
    if (this.redoStack.length === 0 || !this.whiteboardState) return false;

    // Save current state to undo stack
    this.undoStack.push([...this.whiteboardState.elements]);

    // Restore next state
    const nextState = this.redoStack.pop();
    if (nextState) {
      this.whiteboardState.elements = [...nextState];
      this.whiteboardState.version++;
      this.whiteboardState.lastModified = new Date();

      this.emit('stateRestored', this.whiteboardState.elements);
      return true;
    }

    return false;
  }

  async exportWhiteboard(format: 'png' | 'svg' | 'pdf' | 'json'): Promise<Blob | string> {
    if (!this.whiteboardState) {
      throw new Error('No active whiteboard session');
    }

    switch (format) {
      case 'json':
        const exportData = {
          session: this.currentSession,
          whiteboard: this.whiteboardState,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        };
        return JSON.stringify(exportData, null, 2);

      case 'png':
        // This would generate a PNG from the canvas
        // For demo, return a mock blob
        return new Blob(['mock-png-data'], { type: 'image/png' });

      case 'svg':
        // Generate SVG from elements
        const svgContent = this.generateSVG();
        return new Blob([svgContent], { type: 'image/svg+xml' });

      case 'pdf':
        // This would generate a PDF
        // For demo, return a mock blob
        return new Blob(['mock-pdf-data'], { type: 'application/pdf' });

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async importWhiteboard(data: string | File): Promise<boolean> {
    try {
      let importData: any;

      if (typeof data === 'string') {
        importData = JSON.parse(data);
      } else {
        const text = await data.text();
        importData = JSON.parse(text);
      }

      if (importData.whiteboard && importData.whiteboard.elements) {
        // Save current state to undo stack
        this.saveToUndoStack();

        // Import elements
        this.whiteboardState = {
          ...this.whiteboardState!,
          elements: importData.whiteboard.elements,
          version: this.whiteboardState!.version + 1,
          lastModified: new Date()
        };

        this.emit('whiteboardImported', this.whiteboardState.elements);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to import whiteboard:', error);
      return false;
    }
  }

  private saveToUndoStack(): void {
    if (!this.whiteboardState) return;

    this.undoStack.push([...this.whiteboardState.elements]);

    // Limit undo stack size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    // Clear redo stack when new action is performed
    this.redoStack = [];
  }

  private async saveWhiteboardState(): Promise<void> {
    if (!this.whiteboardState || !this.currentSession) return;

    try {
      // In production, this would save to your backend
      const saveData = {
        sessionId: this.currentSession.id,
        state: this.whiteboardState,
        timestamp: Date.now()
      };

      // Mock API call
      console.log('Auto-saving whiteboard state:', saveData);
      
      // You would make an actual API call here:
      // await fetch('/api/whiteboard/save', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(saveData)
      // });

    } catch (error) {
      console.error('Failed to save whiteboard state:', error);
    }
  }

  private generateSVG(): string {
    if (!this.whiteboardState) return '';

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">`;

    this.whiteboardState.elements.forEach(element => {
      switch (element.type) {
        case 'rectangle':
          svgContent += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="none" stroke="${element.color}" stroke-width="${element.strokeWidth}" />`;
          break;
        case 'circle':
          const radius = Math.sqrt(Math.pow(element.width || 0, 2) + Math.pow(element.height || 0, 2)) / 2;
          const cx = element.x + (element.width || 0) / 2;
          const cy = element.y + (element.height || 0) / 2;
          svgContent += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${element.color}" stroke-width="${element.strokeWidth}" />`;
          break;
        case 'text':
          svgContent += `<text x="${element.x}" y="${element.y}" fill="${element.color}" font-size="${element.strokeWidth * 8}" font-family="Arial">${element.content}</text>`;
          break;
        case 'freehand':
          if (element.points && element.points.length > 1) {
            const pathData = `M ${element.points[0].x} ${element.points[0].y} ` + 
              element.points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
            svgContent += `<path d="${pathData}" fill="none" stroke="${element.color}" stroke-width="${element.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`;
          }
          break;
      }
    });

    svgContent += '</svg>';
    return svgContent;
  }

  private handleRemoteElementAdded(element: WhiteboardElement): void {
    if (!this.whiteboardState) return;

    this.whiteboardState.elements.push(element);
    this.whiteboardState.version++;
    this.whiteboardState.lastModified = new Date();

    this.emit('remoteElementAdded', element);
  }

  private handleRemoteElementUpdated(element: WhiteboardElement): void {
    if (!this.whiteboardState) return;

    const index = this.whiteboardState.elements.findIndex(el => el.id === element.id);
    if (index !== -1) {
      this.whiteboardState.elements[index] = element;
      this.whiteboardState.version++;
      this.whiteboardState.lastModified = new Date();

      this.emit('remoteElementUpdated', element);
    }
  }

  private handleRemoteElementDeleted(elementId: string): void {
    if (!this.whiteboardState) return;

    this.whiteboardState.elements = this.whiteboardState.elements.filter(el => el.id !== elementId);
    this.whiteboardState.version++;
    this.whiteboardState.lastModified = new Date();

    this.emit('remoteElementDeleted', elementId);
  }

  private handleRemoteCursorMoved(cursor: WhiteboardCursor): void {
    this.cursors.set(cursor.userId, cursor);
    this.emit('remoteCursorMoved', cursor);
  }

  private handleRemoteWhiteboardCleared(): void {
    if (!this.whiteboardState) return;

    this.whiteboardState.elements = [];
    this.whiteboardState.version++;
    this.whiteboardState.lastModified = new Date();

    this.emit('remoteWhiteboardCleared');
  }

  private handleParticipantJoined(participant: any): void {
    this.emit('participantJoined', participant);
  }

  private handleParticipantLeft(participantId: string): void {
    this.cursors.delete(participantId);
    this.emit('participantLeft', participantId);
  }

  private sendWebSocketMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }

  private generateSessionId(): string {
    return 'wb_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Getters
  getCurrentSession(): WhiteboardSession | null {
    return this.currentSession;
  }

  getWhiteboardState(): WhiteboardState | null {
    return this.whiteboardState;
  }

  getCursors(): Map<string, WhiteboardCursor> {
    return this.cursors;
  }

  getElements(): WhiteboardElement[] {
    return this.whiteboardState?.elements || [];
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  // Cleanup
  disconnect(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.currentSession = null;
    this.whiteboardState = null;
    this.cursors.clear();
    this.undoStack = [];
    this.redoStack = [];
  }
}