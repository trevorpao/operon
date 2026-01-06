import gee from 'trevorpao/geneEH';

const contactPlugin = {
    name: 'data.contact',
    async install() {
        const send = (payload) => new Promise((resolve, reject) => {
            const handler = function () {
                if (!this || this.code !== 1) {
                    reject(this);
                } else {
                    resolve(this);
                }
            };
            gee.yell('contact/add_new', payload, handler, handler);
        });

        return { api: { send } };
    },
};

export default contactPlugin;
