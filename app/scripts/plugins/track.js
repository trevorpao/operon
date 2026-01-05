import gee from 'trevorpao/geneEH';

// Track plugin: GA/FB events with sane defaults.
const trackPlugin = {
    name: 'track',
    async install() {
        const send = (cate, act, label, which) => {
            const category = cate || 'normal';
            const action = act || 'jump';
            const eventLabel = label || document.title || '';
            const target = which || 'ga';

            gee.clog({ cate: category, act: action, label: eventLabel, which: target });

            if ((target === 'ga' || target === 'all') && typeof window.ga === 'function') {
                if (eventLabel) {
                    window.ga('send', 'event', category, action, eventLabel);
                } else {
                    window.ga('send', 'event', category, action);
                }
            }

            if ((target === 'pixel' || target === 'all') && typeof window.fbq === 'function') {
                window.fbq('track', category, action, eventLabel);
            }
        };

        return { api: { send } };
    },
};

export default trackPlugin;
