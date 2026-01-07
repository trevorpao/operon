const contactPlugin = {
    name: 'data.contact',
    async install({ app, gee }) {
        const yellFn = (app && typeof app.yell === 'function') ? app.yell : (gee && typeof gee.yell === 'function' ? gee.yell.bind(gee) : null);
        const send = (payload) => new Promise((resolve, reject) => {
            if (!yellFn) return reject(new Error('yell unavailable'));

            const handler = function () {
                if (!this || this.code !== 1) {
                    reject(this);
                } else {
                    resolve(this);
                }
            };
            yellFn('contact/add_new', payload, handler, handler);
        });

        return { api: { send } };
    },
};

export default contactPlugin;
