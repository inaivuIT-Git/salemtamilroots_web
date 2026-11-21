import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ta"],
  defaultLocale: "en",
  localePrefix: "as-needed", // English at /, Tamil at /ta
});

export type Locale = (typeof routing.locales)[number];
