import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// import translationEN from ' .. /translations/en/translation.json';
// import translationVI from ' .. /translations/vi/translation.json';
const resources = {
    en: {},
    vi: {}
};

i18n
    .use(initReactI18next)
    .init({
        resources
    })

export default i18n;
