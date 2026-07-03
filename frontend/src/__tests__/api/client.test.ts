// src/__tests__/api/client.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ApiError, apiFetch, apiFetchFormData, apiFetchPublic } from '../../api/client';
import * as tokens from '../../lib/tokens';

//1. Mock the tokens module
vi.mock('../../lib/tokens', () => ({
    getStoredTokens: vi.fn(),
    setStoredTokens: vi.fn(),
    clearStoredTokens: vi.fn(),
}));


//2. MOck global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch 

// A fake api URL via environmonent variable
vi.stubEnv('VITE_API_URL', 'https://fakeapi.com');

const { getStoredTokens, setStoredTokens, clearStoredTokens } = vi.mocked(tokens);

beforeEach(() => {
    vi.resetAllMocks();
    // default token state should be : no tokens
    getStoredTokens.mockReturnValue({ accessToken: null, refreshToken: null });
});

// Helper function to mock fetch responses
function makeResponse(
    status: number,
    body: unknown = null,
    statusText: string = 'OK',
): Response {
    const bodyTest = body !==null ? JSON.stringify(body) : "";
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText,
        json: vi.fn().mockResolvedValue(body),
        text: vi.fn().mockResolvedValue(bodyTest),
    } as unknown as Response;
}


// test cases start below

// ApiError class tests

// apiFetch function tests

// apiFetchFormData function tests

// apiFetchPublic function tests