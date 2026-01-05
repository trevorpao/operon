OperonJS
======

Small Flow Controller powered by geneEH, packaged with a CSP-safe Vite + Bulma + Handlebars starter.

## What is inside
- Vite for dev server and build.
- Bulma with a green theme applied via Sass overrides.
- Handlebars runtime with precompiled templates (no unsafe-eval, CSP friendly).
- geneEH (gene-event-handler) for behavior-driven DOM wiring.

## Prerequisites
- Node.js 18+ and npm.
- `gene.min.js` placed under `src/libs/` (or adjust the import path accordingly).

## Quick start (fresh project)
```bash
# scaffold a Vite vanilla project
npm create vite@latest my-operon-app -- --template vanilla
cd my-operon-app

# install core deps
npm install bulma handlebars

# install dev tooling
npm install -D sass vite-plugin-handlebars
```

## Mock data
- Development fixtures live in `mock/` (e.g., `index.json`, `about.json`).
- Serve them with your dev server or load via fetch during local testing.

## Vite configuration (vite.config.js)
Use the Handlebars plugin to precompile templates under `app/tmpls` so the browser never needs `eval`.

```javascript
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { resolve } from 'path';

export default defineConfig({
	plugins: [
		handlebars({
			partialDirectory: resolve(__dirname, 'app/tmpls'),
			context: { title: 'Green SMS Platform' },
		}),
	],
});
```

## Theme (src/style.scss)
Override Bulma tokens to a green palette and add a small anti-flash helper for geneEH mounts.

```scss
$green-primary: #23d160;
$green-dark: #1e8449;

@use "bulma/sass" with (
	$primary: $green-primary,
	$link: $green-dark,
	$family-primary: '"Noto Sans TC", sans-serif'
);

.gee { display: none; }
```

## Handlebars partial example (app/tmpls/sms-form.hbs)
```html
<div class="box has-background-light gee" data-gene="initForm">
	<h3 class="title is-4 has-text-primary">Send a new SMS</h3>
	<div class="field">
		<div class="control">
			<textarea id="sms-msg" class="textarea" placeholder="Type your message..."></textarea>
		</div>
	</div>
	<button class="button is-primary is-fullwidth gee" data-gene="sendAction">
		<strong>Send now</strong>
	</button>
}</div>
```

## Main logic (main.js)
Use Handlebars runtime, initialize geneEH, and attach hooks.

```javascript
import gee from 'trevorpao/geneEH';
import './src/style.scss';
import Handlebars from 'handlebars/runtime';

gee.hook('sendAction', function (me) {
	const form = me;
	const msgInput = form.querySelector('#sms-msg');
	const msg = (msgInput?.value || '').trim();
	if (!msg) {
		alert('Message cannot be empty.');
		return false;
	}

	const submitBtn = form.querySelector('button[type="submit"]');
	submitBtn?.classList.add('is-loading');

	setTimeout(() => {
		submitBtn?.classList.remove('is-loading');
		alert('SMS sent! Content: ' + msg);
	}, 1000);

	return false;
});

gee.hook('initForm', function () {
	console.log('SMS form ready');
});

document.addEventListener('DOMContentLoaded', () => {
	gee.init();
});
```

HTML wiring (submit binding):
```html
<form class="gee" data-gene="init:initForm,submit:sendAction" novalidate>
	<div class="field is-grouped">
		<p class="control is-expanded">
			<input id="sms-msg" class="input" type="text" placeholder="Enter SMS" required>
		</p>
		<p class="control">
			<button type="submit" class="button is-primary">Send</button>
		</p>
	</div>
</form>
```

## Why this starter
- CSP safe: precompiled Handlebars runtime avoids unsafe-eval.
- Lean UI: Bulma is CSS-only; theming via Sass keeps colors consistent.
- Behavior-first: geneEH maps DOM genes to hooks without manual event wiring.
- Fast dev loop: Vite gives instant HMR.

## Scripts
- `npm run dev` – start Vite dev server.
- `npm run build` – production build.
- `npm run preview` – preview the built site.

## Links
- Home page: https://github.com/trevorpao/operon
- Demo page: https://trevorpao.github.io/operon/
- geneEH: https://github.com/trevorpao/geneEH
