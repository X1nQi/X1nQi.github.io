import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",


  locales: {

    "/": {
      lang: "zh-CN",
      title: "Creator's blog",
      // 这个方便SEO使用
      description: "",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
