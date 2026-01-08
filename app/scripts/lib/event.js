import { createEmitter } from './event/emitter';

const emitter = createEmitter();

const on = (topic, handler) => emitter.on(topic, handler);
const off = (topic, handler) => emitter.off(topic, handler);
const once = (topic, handler) => emitter.once(topic, handler);
const emit = (topic, ...args) => emitter.emit(topic, ...args);
const clear = (topic) => emitter.clear(topic);
const listenerCount = (topic) => emitter.listenerCount(topic);

export {
    createEmitter,
    on,
    off,
    once,
    emit,
    clear,
    listenerCount,
};

export default emitter;
