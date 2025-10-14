// i18n.ts

// Copyright (c) 2025, Krzysztof Wiłnicki
// All rights reserved.
//
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  .use(HttpApi) // 👈 Loads translations from server/public folder
  .use(LanguageDetector) // 👈 Detects user language
  .use(initReactI18next) // 👈 Passes i18n instance to react-i18next
  .init({
    // What language to use if translations in user language are not available
    fallbackLng: "en",

    // An array of the languages you support
    supportedLngs: ["en", "pl"],

    // Let i18next-http-backend know where to find the files
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },

    // Allow an empty string as a valid translation key
    // This is useful for keys that might not have a translation yet
    returnEmptyString: false,

    // React-specific options
    react: {
      // This allows you to use <br/> and other simple HTML tags inside your translations
      transKeepBasicHtmlNodesFor: ["br", "strong", "i"],
      // We will wrap our app in a Suspense component to handle loading
      useSuspense: true,
    },

    // For React, we don't need to escape values as it does it by default
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
