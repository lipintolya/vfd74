// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import markdoc from '@astrojs/markdoc';

// https://astro.build/config
export default defineConfig({
  site: 'https://vfd74.ru',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    vue(),
    markdoc(),
    sitemap({
      filter: (page) =>
        page !== 'https://vfd74.ru/privacy/' && page !== 'https://vfd74.ru/privacy' &&
        // Старые UUID-маршруты моделей остаются доступными (чтобы не 404'ить уже
        // проиндексированные ссылки), но в сайтмап должен попадать только
        // канонический слаг-адрес — иначе сайтмап задвоит каждую модель.
        !/\/models\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/?$/.test(page),
      serialize(item) {
        const u = item.url
        if (u === 'https://vfd74.ru/' || u === 'https://vfd74.ru') {
          return { ...item, changefreq: 'weekly', priority: 1.0 }
        }
        if (/\/(catalog|about|contacts|partitions|vhodnye-dveri|designers)\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        if (/\/catalog\/series(\/.+)?\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        if (/\/catalog\/dveri-[^/]+\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        // Цветовые SEO-лендинги — см. src/data/color-categories.ts (слаги
        // там не начинаются с dveri-, отдельная проверка).
        if (/\/catalog\/(belye|seryye|bezhevye|shokolad-mokko)-dveri\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        // Стилевые SEO-лендинги — см. src/data/style-categories.ts.
        if (/\/catalog\/(loft-dveri|minimalizm-dveri)\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        if (/\/articles\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.7 }
        }
        if (/\/portfolio\/?$/.test(u)) {
          return { ...item, changefreq: 'weekly', priority: 0.8 }
        }
        if (/\/portfolio\/.+/.test(u)) {
          return { ...item, changefreq: 'monthly', priority: 0.65 }
        }
        return { ...item, changefreq: 'monthly', priority: 0.6 }
      },
    }),
  ]
});
