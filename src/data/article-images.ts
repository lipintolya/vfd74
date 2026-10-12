/* СГЕНЕРИРОВАНО scripts/gen-article-images.mjs — не править руками.
   Оригинальный URL картинки статьи → облегчённые варианты (srcset).
   Использование — src/lib/article-images.ts. */
export interface ImageVariant { src: string; w: number }

/** Обложки: card — 16:9 для карточек, hero — для шапки статьи. */
export const ARTICLE_COVER_PREVIEWS: Record<string, { card: ImageVariant[]; hero: ImageVariant[] }> = {
  '/renders/articles/alum-zonirovanie-cover.webp': {
    card: [{ src: '/renders/articles/covers/alyuminievye-peregorodki-zonirovanie-card-480.webp', w: 480 }, { src: '/renders/articles/covers/alyuminievye-peregorodki-zonirovanie-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/alyuminievye-peregorodki-zonirovanie-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/alyuminievye-peregorodki-zonirovanie-hero-1600.webp', w: 1600 }],
  },
  '/renders/articles/artdom/cover.webp': {
    card: [{ src: '/renders/articles/covers/artdom-2026-tkanevye-peregorodki-vfd-card-480.webp', w: 480 }, { src: '/renders/articles/covers/artdom-2026-tkanevye-peregorodki-vfd-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/artdom-2026-tkanevye-peregorodki-vfd-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/artdom-2026-tkanevye-peregorodki-vfd-hero-1600.webp', w: 1600 }],
  },
  '/media/statya/white_doors_statya.webp': {
    card: [{ src: '/renders/articles/covers/belye-dveri-pachkayutsya-card-480.webp', w: 480 }, { src: '/renders/articles/covers/belye-dveri-pachkayutsya-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/belye-dveri-pachkayutsya-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/belye-dveri-pachkayutsya-hero-1600.webp', w: 1600 }],
  },
  '/media/Main_page/articles/article_1/cover_st1.webp': {
    card: [{ src: '/renders/articles/covers/kak-vybrat-mezhkomnatnye-dveri-card-480.webp', w: 480 }, { src: '/renders/articles/covers/kak-vybrat-mezhkomnatnye-dveri-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/kak-vybrat-mezhkomnatnye-dveri-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/kak-vybrat-mezhkomnatnye-dveri-hero-1600.webp', w: 1600 }],
  },
  '/renders/articles/coatings/cover-2100.webp': {
    card: [{ src: '/renders/articles/covers/kakoe-pokrytie-dverei-vybrat-card-480.webp', w: 480 }, { src: '/renders/articles/covers/kakoe-pokrytie-dverei-vybrat-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/kakoe-pokrytie-dverei-vybrat-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/kakoe-pokrytie-dverei-vybrat-hero-1600.webp', w: 1600 }],
  },
  '/renders/alum-covers/3.webp': {
    card: [{ src: '/renders/articles/covers/loft-industrial-chic-v-interere-card-480.webp', w: 480 }, { src: '/renders/articles/covers/loft-industrial-chic-v-interere-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/loft-industrial-chic-v-interere-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/loft-industrial-chic-v-interere-hero-1600.webp', w: 1600 }],
  },
  '/media/statya/1.10.26/render_showroom.webp': {
    card: [{ src: '/renders/articles/covers/sovremennaya-klassika-v-interiere-card-480.webp', w: 480 }, { src: '/renders/articles/covers/sovremennaya-klassika-v-interiere-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/sovremennaya-klassika-v-interiere-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/sovremennaya-klassika-v-interiere-hero-1600.webp', w: 1600 }],
  },
  '/media/promo_main/7A842D48-5D78-48B9-AFEE-AA8492800B85.webp': {
    card: [{ src: '/renders/articles/covers/vneshnie-i-skrytye-petli-raznitsa-card-480.webp', w: 480 }, { src: '/renders/articles/covers/vneshnie-i-skrytye-petli-raznitsa-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/vneshnie-i-skrytye-petli-raznitsa-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/vneshnie-i-skrytye-petli-raznitsa-hero-1600.webp', w: 1600 }],
  },
}

/** Фото из текста статей ({% figure %}, {% photo %}, {% card %}). */
export const ARTICLE_IMAGE_VARIANTS: Record<string, ImageVariant[]> = {
  '/media/Main_page/articles/article_1/chitovaya.webp':
    [{ src: '/renders/articles/images/chitovaya-e6821e-640.webp', w: 640 }],
  '/media/Main_page/articles/article_1/cover_pet.png':
    [{ src: '/renders/articles/images/cover_pet-e2de13-640.webp', w: 640 }, { src: '/renders/articles/images/cover_pet-e2de13-960.webp', w: 960 }, { src: '/renders/articles/images/cover_pet-e2de13-1280.webp', w: 1280 }, { src: '/renders/articles/images/cover_pet-e2de13-1600.webp', w: 1600 }],
  '/media/Main_page/articles/article_1/emal_render.webp':
    [{ src: '/renders/articles/images/emal_render-82afad-640.webp', w: 640 }],
  '/media/Main_page/articles/article_1/emalex_render.webp':
    [{ src: '/renders/articles/images/emalex_render-3cfd2c-640.webp', w: 640 }],
  '/media/Main_page/articles/article_1/filenka.webp':
    [{ src: '/renders/articles/images/filenka-1f6f42-640.webp', w: 640 }],
  '/media/Main_page/left_bento/render_urban2.webp':
    [{ src: '/renders/articles/images/render_urban2-66cc94-640.webp', w: 640 }, { src: '/renders/articles/images/render_urban2-66cc94-960.webp', w: 960 }],
  '/media/alum_info/glass_type/14.webp':
    [{ src: '/renders/articles/images/14-b0929a-640.webp', w: 640 }],
  '/media/alum_info/glass_type/2.webp':
    [{ src: '/renders/articles/images/2-3f4b64-640.webp', w: 640 }],
  '/media/alum_info/glass_type/5.webp':
    [{ src: '/renders/articles/images/5-c5ee72-640.webp', w: 640 }],
  '/media/alum_info/glass_type/8.webp':
    [{ src: '/renders/articles/images/8-16c9fc-640.webp', w: 640 }],
  '/media/alum_section/decor_type2.webp':
    [{ src: '/renders/articles/images/decor_type2-a1ab01-640.webp', w: 640 }, { src: '/renders/articles/images/decor_type2-a1ab01-960.webp', w: 960 }],
  '/media/info/petli/in.webp':
    [{ src: '/renders/articles/images/in-5ac2a2-640.webp', w: 640 }],
  '/media/info/petli/in_petli.webp':
    [{ src: '/renders/articles/images/in_petli-96bb69-640.webp', w: 640 }, { src: '/renders/articles/images/in_petli-96bb69-960.webp', w: 960 }],
  '/media/invisible/cover.webp':
    [{ src: '/renders/articles/images/cover-024585-640.webp', w: 640 }, { src: '/renders/articles/images/cover-024585-960.webp', w: 960 }, { src: '/renders/articles/images/cover-024585-1280.webp', w: 1280 }, { src: '/renders/articles/images/cover-024585-1600.webp', w: 1600 }],
  '/media/invisible/invisible.webp':
    [{ src: '/renders/articles/images/invisible-60134b-640.webp', w: 640 }, { src: '/renders/articles/images/invisible-60134b-960.webp', w: 960 }],
  '/media/statya/1.10.26/emalex_er2_cover.webp':
    [{ src: '/renders/articles/images/emalex_er2_cover-f06468-640.webp', w: 640 }, { src: '/renders/articles/images/emalex_er2_cover-f06468-960.webp', w: 960 }, { src: '/renders/articles/images/emalex_er2_cover-f06468-1280.webp', w: 1280 }],
  '/media/statya/1.10.26/reference_cover_palette.webp':
    [{ src: '/renders/articles/images/reference_cover_palette-c25785-640.webp', w: 640 }, { src: '/renders/articles/images/reference_cover_palette-c25785-960.webp', w: 960 }, { src: '/renders/articles/images/reference_cover_palette-c25785-1280.webp', w: 1280 }, { src: '/renders/articles/images/reference_cover_palette-c25785-1600.webp', w: 1600 }],
  '/media/statya/1.10.26/render_showroom2.webp':
    [{ src: '/renders/articles/images/render_showroom2-47b16a-640.webp', w: 640 }, { src: '/renders/articles/images/render_showroom2-47b16a-960.webp', w: 960 }, { src: '/renders/articles/images/render_showroom2-47b16a-1280.webp', w: 1280 }, { src: '/renders/articles/images/render_showroom2-47b16a-1600.webp', w: 1600 }],
  '/media/statya/1.10.26/svet_cover.webp':
    [{ src: '/renders/articles/images/svet_cover-7008d0-640.webp', w: 640 }, { src: '/renders/articles/images/svet_cover-7008d0-960.webp', w: 960 }, { src: '/renders/articles/images/svet_cover-7008d0-1280.webp', w: 1280 }, { src: '/renders/articles/images/svet_cover-7008d0-1600.webp', w: 1600 }],
  '/media/statya/_cleaning_door.webp':
    [{ src: '/renders/articles/images/_cleaning_door-dae002-640.webp', w: 640 }, { src: '/renders/articles/images/_cleaning_door-dae002-960.webp', w: 960 }, { src: '/renders/articles/images/_cleaning_door-dae002-1280.webp', w: 1280 }, { src: '/renders/articles/images/_cleaning_door-dae002-1600.webp', w: 1600 }],
  '/media/statya/emal_render.webp':
    [{ src: '/renders/articles/images/emal_render-c3e03e-640.webp', w: 640 }],
  '/media/statya/innova_render.webp':
    [{ src: '/renders/articles/images/innova_render-7c9b20-640.webp', w: 640 }],
  '/media/statya/urban_render_pro.webp':
    [{ src: '/renders/articles/images/urban_render_pro-35b2c5-640.webp', w: 640 }, { src: '/renders/articles/images/urban_render_pro-35b2c5-960.webp', w: 960 }, { src: '/renders/articles/images/urban_render_pro-35b2c5-1280.webp', w: 1280 }, { src: '/renders/articles/images/urban_render_pro-35b2c5-1600.webp', w: 1600 }],
  '/media/works_prod/12.03.26_urban/-c9niw81Q0pjyOPUKFEJpVWlhQlwpIgHowrNhzv-1MHOnf_rTdIZECkewUvjrEaiL-EdKWilBGV6d6HQDUoGa4eo.webp':
    [{ src: '/renders/articles/images/-c9niw81Q0pjyOPUKFEJpVWlhQlwpIgHowrNhzv--5e36dd-640.webp', w: 640 }, { src: '/renders/articles/images/-c9niw81Q0pjyOPUKFEJpVWlhQlwpIgHowrNhzv--5e36dd-960.webp', w: 960 }],
  '/renders/alum-covers/1.webp':
    [{ src: '/renders/articles/images/1-f49a4c-640.webp', w: 640 }, { src: '/renders/articles/images/1-f49a4c-960.webp', w: 960 }, { src: '/renders/articles/images/1-f49a4c-1280.webp', w: 1280 }, { src: '/renders/articles/images/1-f49a4c-1600.webp', w: 1600 }],
  '/renders/alum-covers/3.webp':
    [{ src: '/renders/articles/images/3-05793b-640.webp', w: 640 }, { src: '/renders/articles/images/3-05793b-960.webp', w: 960 }, { src: '/renders/articles/images/3-05793b-1280.webp', w: 1280 }, { src: '/renders/articles/images/3-05793b-1600.webp', w: 1600 }],
  '/renders/articles/alum-zonirovanie-studio.webp':
    [{ src: '/renders/articles/images/alum-zonirovanie-studio-f48776-640.webp', w: 640 }, { src: '/renders/articles/images/alum-zonirovanie-studio-f48776-960.webp', w: 960 }, { src: '/renders/articles/images/alum-zonirovanie-studio-f48776-1280.webp', w: 1280 }],
  '/renders/articles/artdom/artdom-1.webp':
    [{ src: '/renders/articles/images/artdom-1-c28801-640.webp', w: 640 }, { src: '/renders/articles/images/artdom-1-c28801-960.webp', w: 960 }],
  '/renders/articles/artdom/artdom-2.webp':
    [{ src: '/renders/articles/images/artdom-2-8071ce-640.webp', w: 640 }, { src: '/renders/articles/images/artdom-2-8071ce-960.webp', w: 960 }],
  '/renders/articles/artdom/artdom-3.webp':
    [{ src: '/renders/articles/images/artdom-3-72d714-640.webp', w: 640 }],
  '/renders/articles/artdom/artdom-4.webp':
    [{ src: '/renders/articles/images/artdom-4-116f07-640.webp', w: 640 }],
  '/renders/articles/artdom/artdom-5.webp':
    [{ src: '/renders/articles/images/artdom-5-474f0c-640.webp', w: 640 }, { src: '/renders/articles/images/artdom-5-474f0c-960.webp', w: 960 }],
  '/renders/hidden-doors/sekret-900.webp':
    [{ src: '/renders/articles/images/sekret-900-e26be8-640.webp', w: 640 }],
}
