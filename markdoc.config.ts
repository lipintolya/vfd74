import { defineMarkdocConfig, component } from '@astrojs/markdoc/config'

export default defineMarkdocConfig({
  tags: {
    // Фото с подписью
    // Использование: {% figure src="https://..." alt="..." caption="Подпись" /%}
    // Широкий вариант: {% figure src="..." wide=true /%}
    figure: {
      render: component('./src/components/articles/Figure.astro'),
      selfClosing: true,
      attributes: {
        // Не required: без src рендерится плейсхолдер «Фото скоро» — см.
        // комментарий в Figure.astro.
        src:     { type: String },
        alt:     { type: String },
        caption: { type: String },
        wide:    { type: Boolean, default: false },
        // Схемы/чертежи: без кропа 21:9, компактно по центру колонки
        narrow:  { type: Boolean, default: false },
      },
    },

    // Выделенный блок — совет, важно, предупреждение
    // Использование: {% callout type="tip" title="Совет" %}Текст{% /callout %}
    callout: {
      render: component('./src/components/articles/Callout.astro'),
      attributes: {
        type:  { type: String, default: 'tip', matches: ['tip', 'info', 'warning'] },
        title: { type: String },
      },
    },

    // Сетка карточек (покрытия, конструкции и т.п.) во всю ширину
    // {% cards %}{% card title="Эмаль" image="url" tags="практично, любой цвет" %}текст{% /card %}{% /cards %}
    cards: {
      render: component('./src/components/articles/Cards.astro'),
      attributes: {
        min: { type: Number },
      },
    },
    card: {
      render: component('./src/components/articles/Card.astro'),
      attributes: {
        title:    { type: String, required: true },
        image:    { type: String },
        imageAlt: { type: String },
        tags:     { type: String },
        // Предметные фото на белом фоне: 4:3 + contain вместо кропа 3:4
        contain:  { type: Boolean, default: false },
      },
    },

    // Слайдер реализованных проектов перегородок (кураторская подборка
    // фото из cases в src/data/partitions.ts) — {% projectsSlider /%}
    projectsSlider: {
      render: component('./src/components/articles/ProjectsSlider.astro'),
      selfClosing: true,
    },
  },
})
