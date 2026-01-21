import { describe, it, expect } from 'vitest';
import { getRelanceInfo } from '../src/lib/relance';

describe('getRelanceInfo', () => {
  it('returns null when status is not Envoyé', () => {
    const res = getRelanceInfo(new Date().toISOString(), 'A faire');
    expect(res).toBeNull();
  });

  it('reports today when date is exactly 3 days ago', () => {
    const d = new Date(); d.setDate(d.getDate() - 3);
    const res = getRelanceInfo(d.toISOString(), 'Envoyé');
    expect(res).not.toBeNull();
    // label contains 'AUJOURD' for today case
    expect((res as any).label).toContain("RELANCER" || "AUJOURD");
    expect((res as any).urgent).toBeTruthy();
  });

  it('reports late when date is more than 3 days ago', () => {
    const d = new Date(); d.setDate(d.getDate() - 5);
    const res = getRelanceInfo(d.toISOString(), 'Envoyé');
    expect(res).not.toBeNull();
    expect((res as any).label).toContain('Relance en retard');
    expect((res as any).urgent).toBeTruthy();
  });

  it('reports future relance when date is recent', () => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    const res = getRelanceInfo(d.toISOString(), 'Envoyé');
    expect(res).not.toBeNull();
    expect((res as any).label).toMatch(/Relance dans \d+j/);
  });
});
