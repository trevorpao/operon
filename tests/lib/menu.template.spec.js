import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Handlebars from 'handlebars';
import menuHelpers from '../../app/scripts/lib/helpers/menu.js';

const rootDir = resolve(__dirname, '../../');

const loadFile = (relativePath) => readFileSync(resolve(rootDir, relativePath), 'utf8');

const registerMenuPartials = () => {
    const partials = ['menuItem', 'menuList', 'navbar'];
    partials.forEach((partial) => {
        const source = loadFile(`app/themes/default/partials/${partial}.hbs`);
        Handlebars.registerPartial(partial, source);
    });
};

beforeAll(() => {
    Object.entries(menuHelpers).forEach(([name, fn]) => {
        Handlebars.registerHelper(name, fn);
    });
    registerMenuPartials();
});

describe('mvJsRender Handlebars templates', () => {
    it('renders navbar snapshot with mock menu data', () => {
        const tmpl = Handlebars.compile(loadFile('app/themes/default/partials/navbar.hbs'));
        const payload = JSON.parse(loadFile('app/mock/api/menu_lotsMenu.json'));
        const menu = Array.isArray(payload.data) ? payload.data : [];
        const html = tmpl({ menu });
        expect(html).toMatchSnapshot();
    });
});
