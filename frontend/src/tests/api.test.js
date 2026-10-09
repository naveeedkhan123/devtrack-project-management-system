import { describe, expect, it } from 'vitest';
import { getApiBaseUrl } from '../services/api';

describe('API base URL configuration', () => {
  it('uses the Vite proxy in development when no API URL is set', () => {
    expect(getApiBaseUrl(false, '')).toBe('/api');
  });

  it('requires a separately deployed API URL in production', () => {
    expect(getApiBaseUrl(true, '')).toBeNull();
  });

  it('normalizes the configured API URL', () => {
    expect(getApiBaseUrl(true, ' https://api.example.com/api/ ')).toBe(
      'https://api.example.com/api'
    );
  });
});
