import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  formatAppVersion,
  generateTicketEmailHtml,
  stripGreekAccents
} from '../../../api/send-ticket-notification.js';

describe('Email Template Utilities', () => {
  describe('stripGreekAccents', () => {
    it('strips Greek accent marks (τόνοι) when converting to uppercase', () => {
      expect(stripGreekAccents('Κέντρο Υποστήριξης')).toBe('ΚΕΝΤΡΟ ΥΠΟΣΤΗΡΙΞΗΣ');
      expect(stripGreekAccents('Υψηλή (High)')).toBe('ΥΨΗΛΗ (HIGH)');
      expect(stripGreekAccents('Κανονική (Normal)')).toBe('ΚΑΝΟΝΙΚΗ (NORMAL)');
      expect(stripGreekAccents('Μήνυμα Χρήστη')).toBe('ΜΗΝΥΜΑ ΧΡΗΣΤΗ');
      expect(stripGreekAccents('Ά Έ Ή Ί Ό Ύ Ώ')).toBe('Α Ε Η Ι Ο Υ Ω');
      expect(stripGreekAccents('ά έ ή ί ό ύ ώ')).toBe('Α Ε Η Ι Ο Υ Ω');
    });

    it('preserves dialytika (διαλυτικά) in uppercase conversion', () => {
      expect(stripGreekAccents('προϊόν')).toBe('ΠΡΟΪΟΝ');
      expect(stripGreekAccents('ευφυΐα')).toBe('ΕΥΦΥΪΑ');
      expect(stripGreekAccents('μαΐστρος')).toBe('ΜΑΪΣΤΡΟΣ');
    });

    it('returns empty string on empty or falsy inputs', () => {
      expect(stripGreekAccents('')).toBe('');
      expect(stripGreekAccents(null)).toBe('');
      expect(stripGreekAccents(undefined)).toBe('');
    });
  });

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
    it('renders executive light-theme email template with clean typography and toneless uppercase Greek', () => {
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

      // Validates toneless uppercase Greek headers and badges (strictly no accents on capital letters)
      expect(html).toContain('SPENDLORE &bull; ΚΕΝΤΡΟ ΥΠΟΣΤΗΡΙΞΗΣ');
      expect(html).toContain('ΥΨΗΛΗ (HIGH)');
      expect(html).toContain('ΜΗΝΥΜΑ ΧΡΗΣΤΗ');
      expect(html).not.toContain('ΚΈΝΤΡΟ');
      expect(html).not.toContain('ΥΠΟΣΤΉΡΙΞΗΣ');
      expect(html).not.toContain('ΥΨΗΛΉ');
      expect(html).not.toContain('ΜΉΝΥΜΑ');
      expect(html).not.toContain('ΧΡΉΣΤΗ');

      // Validates metadata inclusion
      expect(html).toContain('Τεχνική Υποστήριξη');
      expect(html).toContain('ebomponis@gmail.com');
      expect(html).toContain('Elias Bomponis');
      expect(html).toContain('Έκδοση 1.1.37');
      expect(html).not.toContain('vΈκδοση 1.1.37');
      expect(html).toContain('t-12345');

      // Validates high priority styling
      expect(html).toContain('#b91c1c');

      // Validates action button
      expect(html).toContain('mailto:ebomponis@gmail.com');
      expect(html).toContain('Απάντηση στον Χρήστη');
    });

    it('handles normal priority and missing optional fields with toneless uppercase', () => {
      const html = generateTicketEmailHtml({
        ticketId: undefined,
        typeLabel: 'Πρόταση Λειτουργίας',
        sender: 'user@example.com',
        userName: undefined,
        appVersion: '1.2.0',
        priority: 'normal'
      });

      expect(html).toContain('ΚΑΝΟΝΙΚΗ (NORMAL)');
      expect(html).not.toContain('ΚΑΝΟΝΙΚΉ');
      expect(html).toContain('v1.2.0');
      expect(html).not.toContain('Ticket ID');
    });
  });
});

