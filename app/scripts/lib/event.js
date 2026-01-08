import { resolveGee } from './runtime/deps';
import { createEmitter, createGeeAdapter } from './event/emitter';

const emitter = createEmitter();
const legacyAdapter = createGeeAdapter(emitter);

const attachGeeEvent = (target) => {
    const geeTarget = target || resolveGee();
    if (!geeTarget || typeof geeTarget !== 'object') return null;
    geeTarget.event = legacyAdapter;
    return geeTarget.event;
};

attachGeeEvent();

const on = (topic, handler) => emitter.on(topic, handler);
const off = (topic, handler) => emitter.off(topic, handler);
const once = (topic, handler) => emitter.once(topic, handler);
const emit = (topic, ...args) => emitter.emit(topic, ...args);
const clear = (topic) => emitter.clear(topic);
const listenerCount = (topic) => emitter.listenerCount(topic);

export {
    createEmitter,
    createGeeAdapter,
    attachGeeEvent,
    legacyAdapter as geeEvent,
    on,
    off,
    once,
    emit,
    clear,
    listenerCount,
};

export default emitter;
