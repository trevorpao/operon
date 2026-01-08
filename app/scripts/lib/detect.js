import { withBrowser } from './shared';

const UA_MOBILE = /Android|iP(hone|od|ad)|Mobile|BlackBerry|IEMobile|Opera Mini|Windows Phone/i;

const DEFAULT_CAPABILITIES = Object.freeze({
	touch: false,
	pointer: false,
	coarsePointer: false,
	hover: true,
	prefersReducedMotion: false,
	prefersDarkMode: false,
	viewportWidth: null,
	viewportHeight: null,
	userAgent: '',
	isMobile: false,
});

const computeCapabilities = (source = {}) => {
	const win = source.window;
	const nav = source.navigator || win?.navigator || {};
	const screen = source.screen || win?.screen || {};
	const matchMedia = source.matchMedia || win?.matchMedia;
	const ua = source.userAgent || nav.userAgent || '';

	const resolveBoolean = (value, fallback) => (typeof value === 'boolean' ? value : fallback);
	const resolveNumber = (value) => (Number.isFinite(value) ? Number(value) : undefined);

	const maxTouchPoints = resolveNumber(source.maxTouchPoints)
		?? resolveNumber(nav.maxTouchPoints)
		?? resolveNumber(nav.msMaxTouchPoints)
		?? 0;

	const hasTouch = resolveBoolean(source.touch, Boolean(maxTouchPoints > 0 || (win && 'ontouchstart' in win)));
	const hasPointer = resolveBoolean(
		source.pointer,
		Boolean((win && 'PointerEvent' in win) || nav.pointerEnabled || nav.msPointerEnabled)
	);

	const coarsePointer = resolveBoolean(
		source.coarsePointer,
		Boolean(typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches)
	);

	const hover = resolveBoolean(
		source.hover,
		Boolean(typeof matchMedia === 'function' ? matchMedia('(hover: hover)').matches : !coarsePointer)
	);

	const prefersReducedMotion = resolveBoolean(
		source.prefersReducedMotion,
		Boolean(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
	);

	const prefersDarkMode = resolveBoolean(
		source.prefersDarkMode,
		Boolean(typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches)
	);

	const width = source.viewportWidth ?? win?.innerWidth ?? screen.width ?? null;
	const height = source.viewportHeight ?? win?.innerHeight ?? screen.height ?? null;

	const fallbackMobile = Boolean(ua && UA_MOBILE.test(ua));
	const isMobile = resolveBoolean(
		source.isMobile,
		Boolean(
			(coarsePointer && hasTouch)
			|| (hasTouch && typeof width === 'number' && width <= 812)
			|| fallbackMobile
		)
	);

	return {
		...DEFAULT_CAPABILITIES,
		touch: hasTouch,
		pointer: hasPointer,
		coarsePointer,
		hover,
		prefersReducedMotion,
		prefersDarkMode,
		viewportWidth: typeof width === 'number' ? width : null,
		viewportHeight: typeof height === 'number' ? height : null,
		userAgent: ua,
		isMobile,
	};
};

let cachedCapabilities = null;

const refreshCapabilities = (overrides) => {
	if (overrides) {
		cachedCapabilities = computeCapabilities(overrides);
	} else {
		cachedCapabilities = withBrowser(
			({ window }) => computeCapabilities({ window }),
			() => computeCapabilities()
		);
	}
	return cachedCapabilities;
};

const getCapabilities = (overrides) => {
	if (overrides) {
		return computeCapabilities(overrides);
	}
	if (!cachedCapabilities) {
		refreshCapabilities();
	}
	return cachedCapabilities;
};

const isMobileDevice = (caps) => Boolean((caps || getCapabilities()).isMobile);
const hasTouchSupport = (caps) => Boolean((caps || getCapabilities()).touch);
const getViewport = () => {
	const caps = getCapabilities();
	return { width: caps.viewportWidth, height: caps.viewportHeight };
};

refreshCapabilities();

const detect = {
	getCapabilities,
	refreshCapabilities,
	isMobileDevice,
	hasTouchSupport,
	getViewport,
};

export {
	getCapabilities,
	refreshCapabilities,
	isMobileDevice,
	hasTouchSupport,
	getViewport,
};

export default detect;
