// Simple demo plugin to validate the plugin registry.
const greetPlugin = {
    name: 'util.greet',
    async install() {
        const api = {
            hello(who = 'World') {
                // eslint-disable-next-line no-console
                console.log(`Hello, ${who}!`);
            },
            goodbye(who = 'World') {
                // eslint-disable-next-line no-console
                console.log(`Goodbye, ${who}!`);
            },
        };
        return { api };
    },
};

export default greetPlugin;
