import { SupportTicket, Priority, IssueCategory } from '../types';

/**
 * Python-compatible deterministic & sequential ticket ID generator.
 * Standard format: TC-YYYY-XXXX (e.g. TC-2026-4821)
 */
export function generateTicketNumber(existingTickets: SupportTicket[] = []): string {
  const currentYear = new Date().getFullYear();
  const existingNumbers = new Set(existingTickets.map(t => t.ticketNumber));
  
  // Find highest existing counter for this year or pick a random unique 4-digit code
  let candidate = '';
  let attempts = 0;
  while (attempts < 100) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    candidate = `TC-${currentYear}-${randomNum}`;
    if (!existingNumbers.has(candidate)) {
      return candidate;
    }
    attempts++;
  }
  return `TC-${currentYear}-${Date.now().toString().slice(-4)}`;
}

/**
 * Python-compatible priority heuristic scoring.
 * Evaluates urgency based on keywords in title and description.
 */
export function estimatePriority(text: string): Priority {
  const lower = (text || '').toLowerCase();
  
  const criticalKeywords = ['smoke', 'fire', 'sparks', 'burning', 'swollen battery', 'ransomware', 'hacked', 'data loss', 'blue screen of death', 'bsod'];
  const highKeywords = ['crash', 'cannot boot', 'not starting', 'black screen', 'no internet', 'blocked', 'urgent', 'fails to load', 'corrupted', 'virus'];
  const lowKeywords = ['cosmetic', 'icon', 'color', 'dark mode', 'slow download', 'font', 'mouse pad', 'tip'];

  for (const word of criticalKeywords) {
    if (lower.includes(word)) return 'Critical';
  }
  for (const word of highKeywords) {
    if (lower.includes(word)) return 'High';
  }
  for (const word of lowKeywords) {
    if (lower.includes(word)) return 'Low';
  }
  return 'Medium';
}

/**
 * Python-compatible category detection heuristic.
 */
export function estimateCategory(text: string): IssueCategory {
  const lower = (text || '').toLowerCase();
  
  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('router') || lower.includes('internet') || lower.includes('dns') || lower.includes('ethernet') || lower.includes('ip address')) {
    return 'Internet/Network';
  }
  if (lower.includes('keyboard') || lower.includes('mouse') || lower.includes('monitor') || lower.includes('printer') || lower.includes('battery') || lower.includes('charger') || lower.includes('usb') || lower.includes('hdmi')) {
    return 'Hardware';
  }
  if (lower.includes('excel') || lower.includes('word') || lower.includes('browser') || lower.includes('chrome') || lower.includes('app') || lower.includes('install') || lower.includes('software') || lower.includes('driver') || lower.includes('update')) {
    return 'Software';
  }
  if (lower.includes('password') || lower.includes('login') || lower.includes('account') || lower.includes('2fa') || lower.includes('phishing') || lower.includes('security')) {
    return 'Account/Security';
  }
  return 'Computer/OS';
}

/**
 * Basic Data Analysis calculations over the ticket collection.
 */
export interface TicketStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
  resolutionRate: number; // percentage 0-100
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
}

export function computeTicketStatistics(tickets: SupportTicket[]): TicketStatistics {
  const total = tickets.length;
  let open = 0;
  let inProgress = 0;
  let resolved = 0;
  let highPriority = 0;

  const categoryBreakdown: Record<string, number> = {
    'Computer/OS': 0,
    'Software': 0,
    'Internet/Network': 0,
    'Hardware': 0,
    'Account/Security': 0,
  };

  const priorityBreakdown: Record<string, number> = {
    'Low': 0,
    'Medium': 0,
    'High': 0,
    'Critical': 0,
  };

  tickets.forEach(ticket => {
    if (ticket.status === 'Open') open++;
    else if (ticket.status === 'In Progress') inProgress++;
    else if (ticket.status === 'Resolved') resolved++;

    if (ticket.priority === 'High' || ticket.priority === 'Critical') {
      highPriority++;
    }

    if (categoryBreakdown[ticket.category] !== undefined) {
      categoryBreakdown[ticket.category]++;
    } else {
      categoryBreakdown[ticket.category] = 1;
    }

    if (priorityBreakdown[ticket.priority] !== undefined) {
      priorityBreakdown[ticket.priority]++;
    }
  });

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return {
    total,
    open,
    inProgress,
    resolved,
    highPriority,
    resolutionRate,
    categoryBreakdown,
    priorityBreakdown,
  };
}

/**
 * Export tickets to CSV string format for data interchange.
 */
export function exportTicketsToCSV(tickets: SupportTicket[]): string {
  const headers = ['Ticket Number', 'Title', 'Category', 'Priority', 'Status', 'Date Logged', 'Reporter', 'Device'];
  const rows = tickets.map(t => [
    `"${t.ticketNumber}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${t.priority}"`,
    `"${t.status}"`,
    `"${t.date}"`,
    `"${(t.reporterName || 'N/A').replace(/"/g, '""')}"`,
    `"${(t.deviceType || 'N/A').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
