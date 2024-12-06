type Listener = (...args: unknown[]) => void;

class CustomEvent {
  events: { [key: string]: Listener[] } = {};

  on(event: string, listener: Listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    const eventsRef = this.events[event] as Listener[];

    eventsRef.push(listener);
  }

  off(event: string, listener: Listener) {
    this.events[event] = this.events[event]?.filter(
      (l) => l !== listener,
    ) as Listener[];
  }

  emit(event: string, ...args: unknown[]) {
    this.events[event]?.forEach((listener) => listener(...args));
  }
}

export const customEvent = new CustomEvent();
