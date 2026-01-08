export { createPlugin } from './defaultPlugin';

export {
	postMessage,
	receiveMessage,
	createMessageValidator,
	createMessageListener,
	requestResponse,
} from './postmessage';

export {
	isBrowser,
	isSSR,
	toStringSafe,
	toNumberSafe,
	toNodes,
	toElements,
	toElement,
	ensureBrowser,
	withBrowser,
	withDocument,
	WHITESPACE_RE,
} from './shared';

export { placeholder } from './dom/placeholder';
export { alterClass, hasMutilClass, visible } from './dom/classList';
export { serializeFormJSON } from './forms/serialize';
export { formatNum } from './number/format';
