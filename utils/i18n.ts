import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

const resources = {
  en: {
    translation: require("../assets/locales/en/translation.json"),
    faq: require("../assets/locales/en/faq.json"),
  },
  nl: {
    translation: require("../assets/locales/nl/translation.json"),
    faq: require("../assets/locales/nl/faq.json"),
  },
  de: {
    translation: require("../assets/locales/de/translation.json"),
    faq: require("../assets/locales/de/faq.json"),
  },
  fr: {
    translation: require("../assets/locales/fr/translation.json"),
    faq: require("../assets/locales/fr/faq.json"),
  },
};
const rtlLanguages = ["ar", "he"];

export const supportedLngs = ["en", "nl", "de", "fr"];

export default function InitI18n() {
  let locale = Localization.getLocales()[0]?.languageCode || "en";
  const isRTL = rtlLanguages.includes(locale);

  if (isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }
  // Testing purposes
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);

  i18n.use(initReactI18next).init({
    resources,
    lng: locale,
    ns: ["translation", "faq"],
    supportedLngs,
    fallbackLng: "en",
  });

  return;
}
