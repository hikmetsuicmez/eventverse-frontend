// Event emitter için basit bir yapı
const notificationEvents = {
  listeners: new Set(),
  emit(event) {
    this.listeners.forEach(listener => listener(event));
  },
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};

export { notificationEvents }; 