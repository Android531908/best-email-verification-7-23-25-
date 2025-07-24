// Browser-compatible EventEmitter implementation
export interface EventListener {
  (...args: any[]): void;
}

export interface EventMap {
  [event: string]: EventListener[];
}

export class EventEmitter {
  private events: EventMap = {};
  private maxListeners: number = 10;

  // Add a listener for an event
  on(event: string, listener: EventListener): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(listener);
    
    // Warn if too many listeners
    if (this.events[event].length > this.maxListeners) {
      console.warn(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${this.events[event].length} ${event} listeners added.`);
    }
    
    return this;
  }

  // Add a one-time listener for an event
  once(event: string, listener: EventListener): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener.apply(this, args);
    };
    
    return this.on(event, onceWrapper);
  }

  // Remove a listener for an event
  off(event: string, listener: EventListener): this {
    if (!this.events[event]) {
      return this;
    }
    
    const index = this.events[event].indexOf(listener);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
    
    // Clean up empty event arrays
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
    
    return this;
  }

  // Remove all listeners for an event, or all events if no event specified
  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    
    return this;
  }

  // Emit an event to all listeners
  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) {
      return false;
    }
    
    // Create a copy of the listeners array to avoid issues if listeners are modified during emission
    const listeners = [...this.events[event]];
    
    for (const listener of listeners) {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    }
    
    return true;
  }

  // Get the number of listeners for an event
  listenerCount(event: string): number {
    return this.events[event] ? this.events[event].length : 0;
  }

  // Get all listeners for an event
  listeners(event: string): EventListener[] {
    return this.events[event] ? [...this.events[event]] : [];
  }

  // Get all event names that have listeners
  eventNames(): string[] {
    return Object.keys(this.events);
  }

  // Set the maximum number of listeners before warning
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  // Get the maximum number of listeners
  getMaxListeners(): number {
    return this.maxListeners;
  }

  // Alias methods for compatibility
  addListener = this.on;
  removeListener = this.off;
}

// Default export for compatibility
export default EventEmitter;