import { describe, it, expect, vi } from 'vitest';
import {
    createMessageValidator,
    requestResponse,
} from '../../app/scripts/lib/postmessage';

const ORIGIN = 'https://example.com/frame.html';

const dispatchResponse = (requestId, data, origin = new URL(ORIGIN).origin) => {
    window.dispatchEvent(new MessageEvent('message', {
        data: JSON.stringify({ requestId, ...data }),
        origin,
    }));
};

describe('postmessage utilities', () => {
    it('validates payloads using schema helpers', () => {
        const validator = createMessageValidator({
            status: 'string',
            count: (value) => Number(value) > 0,
        });

        expect(validator({ status: 'ok', count: 2 })).toBe(true);
        expect(validator({ status: 'ok', count: 0 })).toBe(false);
        expect(validator({ status: 10, count: 2 })).toBe(false);
    });

    it('resolves request/response promises when schema matches', async () => {
        const postSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation((payload, origin) => {
            const params = new URLSearchParams(payload);
            const requestId = params.get('requestId');
            setTimeout(() => dispatchResponse(requestId, { status: 'ok', count: 3 }, origin));
        });

        const response = await requestResponse({
            message: { action: 'ping' },
            targetUrl: ORIGIN,
            schema: { status: 'string', count: (value) => Number(value) > 0 },
            timeout: 200,
        });

        expect(response.data.status).toBe('ok');
        expect(response.data.count).toBe(3);
        postSpy.mockRestore();
    });

    it('rejects when response schema mismatches', async () => {
        const postSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation((payload, origin) => {
            const params = new URLSearchParams(payload);
            const requestId = params.get('requestId');
            setTimeout(() => dispatchResponse(requestId, { count: 0 }, origin));
        });

        await expect(requestResponse({
            message: { action: 'ping' },
            targetUrl: ORIGIN,
            schema: { status: 'string' },
            timeout: 200,
        })).rejects.toThrow('Response schema mismatch');

        postSpy.mockRestore();
    });
});
