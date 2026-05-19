// Content Moderation Types
export interface ModerationRequest {
  text: string;
}

export interface ModerationResponse {
  original: string;
  sanitized: string;
  latencyMs: number;
}

// Booking System Types
export interface Service {
  id: string;
  name: string;
  description: string;
}

export interface AvailabilitySlot {
  id: string;
  serviceId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  status: 'AVAILABLE' | 'BOOKED';
}

export interface Booking {
  id: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  createdAt: string; // ISO String
}

export interface CreateBookingRequest {
  slotId: string;
  customerName: string;
  customerEmail: string;
}

// Analytics and Shared State Types
export interface AnalyticsEvent {
  id: string;
  eventType: 'navigate' | 'select_node' | 'moderate' | 'book_slot' | 'toggle_view';
  nodeId?: string;
  timestamp: string;
  meta?: Record<string, any>;
}
