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
describe('apiFetchPublic', () => {
    it("should make a request for data without authorization", async () => {
        mockFetch.mockResolvedValue(makeResponse(200, { public: true }));

        await apiFetchPublic("/open"); //I am not entirely sure if open or /open is the correct path, but I will assume it is for now

        const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & {headers: Headers}];
        expect(init.headers.get("Authorization")).toBeNull();
    });

    it("should set Content-Type: application/json when body is present", async () => {
        mockFetch.mockResolvedValue(makeResponse(200, {}));

        await apiFetchPublic("/open", { method: "POST", body: JSON.stringify({ q: 1 }) });

        const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & {headers: Headers}];
        expect(init.headers.get("Content-Type")).toBe("application/json");
    });

    it("should return parsed JSON on success", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(200, {greetings: "COMRADE"}));

        const result = await apiFetchPublic("/open");
        expect(result).toEqual({greetings: "COMRADE"});
    }); // just to put it out there, I just find it funny to greet people with Comrade, no particular reason

    it("should throw ApiError on non-ok response", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(404, {error: "Not Found"}, "Not Found"));

        await expect(apiFetchPublic("/missing")).rejects.toMatchObject({
            status: 404,
            message: "Not Found",
        });
    });

    it("does not perform token refresh on 401 response (public endpoint)", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(401, { detail: "Unauthorized" }));

        await expect(apiFetchPublic("/open")).rejects.toMatchObject({
            status: 401,
            message: "Unauthorized",
        });

        // Onlu 1 fetch call : no refresh attempt should be made for public endpoints
        expect(mockFetch).toHaveBeenCalledTimes(1);
});