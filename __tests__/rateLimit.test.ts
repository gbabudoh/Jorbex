import { rateLimit, getIp } from '@/lib/rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    // Each test uses a unique key prefix so they don't share state
  });

  it('allows requests within the limit', () => {
    const key = `test-allow-${Date.now()}`;
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
  });

  it('blocks requests exceeding the limit', () => {
    const key = `test-block-${Date.now()}`;
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });

  it('resets after the window expires', () => {
    const key = `test-reset-${Date.now()}`;
    // Use a 1ms window so it expires immediately
    rateLimit(key, 1, 1);
    rateLimit(key, 1, 1); // should be blocked in same window
    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(rateLimit(key, 1, 60_000)).toBe(true);
        resolve();
      }, 5);
    });
  });

  it('isolates different keys', () => {
    const key1 = `test-iso-a-${Date.now()}`;
    const key2 = `test-iso-b-${Date.now()}`;
    rateLimit(key1, 1, 60_000);
    // key1 should now be blocked
    expect(rateLimit(key1, 1, 60_000)).toBe(false);
    // key2 should still be allowed
    expect(rateLimit(key2, 1, 60_000)).toBe(true);
  });
});

describe('getIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getIp(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-real-ip': '9.10.11.12' },
    });
    expect(getIp(req)).toBe('9.10.11.12');
  });

  it('returns "unknown" when no IP headers present', () => {
    const req = new Request('http://localhost/');
    expect(getIp(req)).toBe('unknown');
  });
});
