import { describe, it, expect } from 'vitest';
import { escapeHtml, formatAppVersion, generateTicketEmailHtml } from '../../../api/send-ticket-notification.js';

describe('Email Template Utilities', () => {
  describe('escapeHtml', () => {
    it('escapes dangerous HTML characters', () => {
      const input = '<script>alert("xss")</script> & \'test\'';
      const escaped = escapeHtml(input);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#039;test&#039;');
    });

    it('returns empty string on empty/falsy inputs', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('formatAppVersion', () => {
    it('preserves localized Greek version strings without duplicate v', () => {
      expect(formatAppVersion('Έκδοση 1.1.37')).toBe('Έκδοση 1.1.37');
    });

    it('preserves English version strings', () => {
      expect(formatAppVersion('Version 1.1.37')).toBe('Version 1.1.37');
    });

    it('handles already-prefixed v strings', () => {
      expect(formatAppVersion('v1.1.37')).toBe('v1.1.37');
    });

    it('prefixes plain version numbers with v', () => {
      expect(formatAppVersion('1.1.37')).toBe('v1.1.37');
    });

    it('returns N/A when version is missing', () => {
      expect(formatAppVersion(null)).toBe('N/A');
      expect(formatAppVersion('')).toBe('N/A');
    });
  });

  describe('generateTicketEmailHtml', () => {
    it('renders executive light-theme email template with clean typography', () => {
      const html = generateTicketEmailHtml({
        ticketId: 't-12345',
        typeLabel: 'Τεχνική Υποστήριξη',
        sender: 'ebomponis@gmail.com',
        userName: 'Elias Bomponis',
        appVersion: 'Έκδοση 1.1.37',
        priority: 'high'
      });

      // Validates light-theme styling
      expect(html).toContain('background-color: #f8fafc');
      expect(html).toContain('background-color: #ffffff');
      expect(html).toContain('color: #0f172a');

      // Validates zero AI visual slop (no purple gradients, no emojis)
      expect(html).not.toContain('#7c3aed');
      expect(html).not.toContain('💡');

      // Validates metadata inclusion
      expect(html).toContain('Τεχνική Υποστήριξη');
      expect(html).toContain('ebomponis@gmail.com');
      expect(html).toContain('Elias Bomponis');
      expect(html).toContain('Έκδοση 1.1.37');
      expect(html).not.toContain('vΈκδοση 1.1.37');
      expect(html).toContain('t-12345');

      // Validates high priority styling
      expect(html).toContain('Υψηλή (High)');
      expect(html).toContain('#b91c1c');

      // Validates action button
      expect(html).toContain('mailto:ebomponis@gmail.com');
      expect(html).toContain('Απάντηση στον Χρήστη');
    });

    it('handles normal priority and missing optional fields', () => {
      const html = generateTicketEmailHtml({
        ticketId: undefined,
        typeLabel: 'Πρόταση Λειτουργίας',
        sender: 'user@example.com',
        userName: undefined,
        appVersion: '1.2.0',
        priority: 'normal'
      });

      expect(html).toContain('Κανονική (Normal)');
      expect(html).toContain('v1.2.0');
      expect(html).not.toContain('Ticket ID');
    });
  });
});

