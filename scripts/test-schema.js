#!/usr/bin/env node
const { readFileSync } = require('node:fs');
const path = require('node:path');
const Ajv = require('ajv');

const rootDir = path.resolve(__dirname, '..');

const fixtures = {
    menu: {
        schema: 'docs/spec/Archived/mvJsRender/schemas/menu.json',
        data: 'app/mock/api/menu_lotsMenu.json',
        description: 'mvJsRender lots menu payload',
    },
};

const args = process.argv.slice(2);
const targets = args.length > 0 ? args : Object.keys(fixtures);

const ajv = new Ajv({
    allErrors: true,
    strict: false,
});

let hasError = false;

const loadJson = (filePath) => {
    const absPath = path.resolve(rootDir, filePath);
    const raw = readFileSync(absPath, 'utf8');
    return JSON.parse(raw);
};

const formatErrors = (errors = []) => errors.map((err) => `${err.instancePath || '(root)'} ${err.message}`).join('\n');

targets.forEach((target) => {
    const fixture = fixtures[target];
    if (!fixture) {
        hasError = true;
        console.error(`✖ Unknown schema alias: ${target}`);
        return;
    }

    try {
        const schema = loadJson(fixture.schema);
        const data = loadJson(fixture.data);
        const validate = ajv.compile(schema);
        const valid = validate(data);
        if (!valid) {
            hasError = true;
            console.error(`✖ ${fixture.description} failed validation`);
            console.error(formatErrors(validate.errors));
        } else {
            console.log(`✔ ${fixture.description} passed (${fixture.schema})`);
        }
    } catch (err) {
        hasError = true;
        console.error(`✖ Failed to validate ${target}: ${err.message}`);
    }
});

if (hasError) {
    process.exit(1);
}

console.log('All requested schemas passed.');
