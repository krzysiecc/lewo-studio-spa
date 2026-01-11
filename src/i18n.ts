// i18n.ts

// Copyright (c) 2026, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

void i18n
  .use(HttpApi) // loads translations from server/public folder
  .use(LanguageDetector) // detects user language
  .use(initReactI18next) // passes i18n instance to react-i18next
  .init({
    // what language to use if translations in user language are not available
    fallbackLng: "en",

    // an array of supported languages
    supportedLngs: ["en", "pl"],

    // specify where i18next-http-backend should find translation files
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },

    // allow an empty string as a valid translation key
    // useful for keys that may not have a translation yet
    returnEmptyString: false,

    // react-specific options
    react: {
      // allow use of <br/> and other simple HTML tags inside translations
      transKeepBasicHtmlNodesFor: ["br", "strong", "i"],
      // application should be wrapped in a Suspense component to handle loading
      useSuspense: true,
    },

    // for react, escaping values is not necessary because it is handled by react by default
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
