import { describe, it, expect, vi } from 'vitest';
import { createEmitter, createGeeAdapter } from '../../../app/scripts/lib/event/emitter';

describe('createEmitter', () => {
    it('registers and unregisters listeners', () => {
        const emitter = createEmitter();
        const handler = vi.fn();
        const teardown = emitter.on('order.created', handler);

        emitter.emit('order.created', { id: 1 });
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ id: 1 });

        teardown();
        emitter.emit('order.created', { id: 2 });
        expect(handler).toHaveBeenCalledTimes(1);
        expect(emitter.listenerCount('order.created')).toBe(0);
    });

    it('supports once and wildcard topics', () => {
        const emitter = createEmitter();
        const onceHandler = vi.fn();
        const wildcardHandler = vi.fn();

        emitter.once('order.created', onceHandler);
        emitter.on('order.*', wildcardHandler);

        emitter.emit('order.created', { id: 10 });
        emitter.emit('order.created', { id: 11 });

        expect(onceHandler).toHaveBeenCalledTimes(1);
        expect(onceHandler).toHaveBeenCalledWith({ id: 10 });
        expect(wildcardHandler).toHaveBeenCalledTimes(2);
        expect(wildcardHandler).toHaveBeenCalledWith('order.created', { id: 10 });
    });
});

describe('createGeeAdapter', () => {
    it('provides legacy subscribe/fire api', () => {
        const emitter = createEmitter();
        const adapter = createGeeAdapter(emitter);
        const handler = vi.fn();

        adapter.subscribe('profile.updated', handler);
        adapter.fire('profile.updated', { ok: true });
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ ok: true });

        adapter.clear('profile.updated');
        adapter.fire('profile.updated', { ok: false });
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('monitors until predicate passes', () => {
        const emitter = createEmitter();
        const adapter = createGeeAdapter(emitter);
        const calls = [];

        adapter.monitor('queue.ready', (payload) => {
            calls.push(payload || null);
            return calls.length >= 3;
        });

        expect(calls).toHaveLength(1); // initial invocation without args
        adapter.fire('queue.ready', 'first');
        adapter.fire('queue.ready', 'second');
        adapter.fire('queue.ready', 'third');
        expect(calls).toEqual([null, 'first', 'second']);
    });
});
