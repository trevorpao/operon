import { describe, it, expect, vi } from 'vitest';
import { createEmitter } from '../../../app/scripts/lib/event/emitter';

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

    it('clears listeners and reports counts', () => {
        const emitter = createEmitter();
        const handler = vi.fn();
        emitter.on('user.login', handler);
        expect(emitter.listenerCount('user.login')).toBe(1);
        emitter.clear('user.login');
        expect(emitter.listenerCount('user.login')).toBe(0);
    });
});
