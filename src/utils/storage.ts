import { SupportTicket } from '../types';

const STORAGE_KEY = 'techcare_tickets_v1';

export function getStoredTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load tickets from localStorage:', err);
    return [];
  }
}

export function saveStoredTickets(tickets: SupportTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Failed to save tickets to localStorage:', err);
  }
}

export function addTicket(ticket: SupportTicket): SupportTicket[] {
  const current = getStoredTickets();
  const updated = [ticket, ...current];
  saveStoredTickets(updated);
  return updated;
}

export function updateTicketInStorage(id: string, updates: Partial<SupportTicket>): SupportTicket[] {
  const current = getStoredTickets();
  const updated = current.map(t => {
    if (t.id === id) {
      return {
        ...t,
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }
    return t;
  });
  saveStoredTickets(updated);
  return updated;
}

export function deleteTicketFromStorage(id: string): SupportTicket[] {
  const current = getStoredTickets();
  const updated = current.filter(t => t.id !== id);
  saveStoredTickets(updated);
  return updated;
}
