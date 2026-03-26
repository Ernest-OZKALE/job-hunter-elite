import { describe, it, expect } from 'vitest';
import { applicationsToCsv } from '../src/lib/exportCsv';

describe('applicationsToCsv', () => {
  it('generates CSV with headers and rows', () => {
    const apps = [
      { date: '2025-12-01', company: 'Acme', position: 'Dev', status: 'Envoyé', salary: '50000', link: 'https://acme.example', attachments: [{name:'CV.pdf'}], notes: 'Note' }
    ];
    const csv = applicationsToCsv(apps);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('Date');
    expect(lines[1]).toContain('2025-12-01');
    expect(lines[1]).toContain('Acme');
    expect(lines[1]).toContain('CV.pdf');
  });
});
