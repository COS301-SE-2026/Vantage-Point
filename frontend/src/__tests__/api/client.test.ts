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
vi.stubGlobal('fetch', mockFetch);

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
describe("ApiError", () => {
    it("carries the HTTP status and message", () => {
        const err = new ApiError(404, "Not Found");
        expect(err.status).toBe(404);
        expect(err.message).toBe("Not Found");
        expect(err.name).toBe("ApiError");
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(ApiError);
    });
}); 

// apiFetch function tests

// apiFetchFormData function tests
describe("apiFetchFormData", () => {
    it("Should POSTs FormData to the correct URL", async () => {
        mockFetch.mockResolvedValue(makeResponse(200, { uploaded: true }));

        
        const formData = new FormData();
        formData.append("file", "blobdata");
        await apiFetchFormData("/upload", formData);

        const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit & {headers: Headers}];
        expect(url).toBe("https://fakeapi.com/upload");
        expect(init.method).toBe("POST");
        expect(init.body).toBe(formData);
    });

    it("should attach Authorization header if access token is present", async () => {
        getStoredTokens.mockReturnValue({ accessToken: "abc-123", refreshToken: "null" });

        mockFetch.mockResolvedValue(makeResponse(200, {}));

        await apiFetchFormData("/upload", new FormData());

        const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & {headers: Headers}];
        expect(init.headers.get("Authorization")).toBe("Bearer abc-123");
    });

    it("should not set Content-Type (lets browser set multipart/form-data boundary)", async () => {
        mockFetch.mockResolvedValue(makeResponse(200, {}));

        await apiFetchFormData("/upload", new FormData());

        const [, init] = mockFetch.mock.calls[0] as [string, RequestInit & {headers: Headers}];
        expect(init.headers.get("Content-Type")).toBeNull();
    });

    it("should return parsed JSON on success", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(200, { id: 69 }));

        const result = await apiFetchFormData("/upload", new FormData());
        expect(result).toEqual({ id: 69 });
    }); // we all know why 69 is such a nice number

    it("should throw ApiError on non-ok response", async () => {
        mockFetch.mockResolvedValueOnce(makeResponse(413, { detail: "File is too large big boss" }));

        await expect(apiFetchFormData("/upload", new FormData())).rejects.toMatchObject({
            status: 413,
            message: "File is too large big boss",
        });
    });

    it("should retry with a new token after successful refresh on 401 response", async () => {
        getStoredTokens
        .mockReturnValueOnce({ accessToken: "old-token", refreshToken: "refresh-token" }) // initial call returns old token
        .mockReturnValueOnce({ accessToken: "old-token", refreshToken: "refresh-token" }) //this call is for the first fetch call, which will return 401, so we need to return the same old token
        .mockReturnValueOnce({ accessToken: "new-token", refreshToken: "refresh-token" }); // after refresh, returns new token

        mockFetch
        .mockResolvedValueOnce(makeResponse(401, { detail: "Unauthorized" })) // first fetch call returns 401
        .mockResolvedValueOnce(makeResponse(200, { accessToken: "new-token", refreshToken: "refresh-token" })) // second fetch call returns 200
        .mockResolvedValueOnce(makeResponse(200, { done: true })); // third fetch call returns 200
        
        const result = await apiFetchFormData<{ done: boolean }>("/upload", new FormData());

        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(result).toEqual({ done: true });
    });

    it("should not rety when retryOnUnauthorized is false", async () => {
        getStoredTokens.mockReturnValue({ accessToken: "old-token", refreshToken: "refresh-token" });

        mockFetch.mockResolvedValueOnce(makeResponse(401, {}));

        await expect(apiFetchFormData("/upload", new FormData(), false)).rejects.toMatchObject({
            status: 401,
        });
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
});

// apiFetchPublic function tests
describe("apiFetchPublic", () => {
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

        // Only 1 fetch call : no refresh attempt should be made for public endpoints
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
});