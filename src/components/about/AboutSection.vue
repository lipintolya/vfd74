<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {
  companyInfo,
  director,
  galleryImages,
  requisites,
  paymentMethods,
} from './about-data'

/* ============================================================
   Lightbox
============================================================ */
const lightboxIndex = ref<number | null>(null)

/* SSR рендерит лайтбокс закрытым, но Teleport-в-body всё равно попадает в
   SSR-разметку как placeholder и коллизирует со служебной разметкой Astro
   (astro-island/astro-slot) — Vue при гидратации ловит "Hydration node
   mismatch" (см. тот же фикс в Reviews.vue). Лайтбокс нужен только после
   клика, поэтому держим Teleport вне SSR/гидратации вовсе. */
const mounted = ref(false)

const openLightbox = (index: number) => {
  lightboxIndex.value = index
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxIndex.value = null
  document.body.style.overflow = ''
}

const prevImage = () => {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value - 1 + galleryImages.length) % galleryImages.length
}

const nextImage = () => {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value + 1) % galleryImages.length
}

const handleKeydown = (e: KeyboardEvent) => {
  if (lightboxIndex.value === null) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevImage()
  if (e.key === 'ArrowRight') nextImage()
}

onMounted(() => {
  mounted.value = true
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="about-page">

    <!-- ======================================================
         HERO
    ======================================================= -->
    <section class="about-hero section section--lg">
      <div class="container">

        <div class="hero-grid">

          <!-- LEFT -->
          <div class="hero-content">

            <div class="hero-badge">
              ДВЕРИ ОТ ФАБРИКИ БЕЗ ПОСРЕДНИКОВ
            </div>

            <h1 class="hero-title">
              ВФД
              <span>все начинается с дверей</span>
            </h1>

            <p class="hero-description">
            Мы работаем напрямую с Владимирской фабрикой дверей и предлагаем 
            всё для интерьера в одном месте: двери, перегородки и фурнитуру.

            Здесь не выбирают «по картинке» — вы сравниваете материалы вживую, 
            видите реальные оттенки при разном освещении и сразу понимаете, 
            как это будет смотреться в вашем интерьере.

            Более 10 лет мы помогаем частным клиентам, дизайнерам и студиям, 
            а также реализуем проекты для коммерческих объектов — от квартир до офисов.
            </p>

            <div class="hero-actions">
              <a href="https://t.me/vfddoors74" target="_blank" rel="noopener" class="hero-btn hero-btn--primary">
                Написать в Telegram
              </a>

              <a
                href="https://yandex.ru/maps/-/CPTwZPi-"
                target="_blank"
                rel="noopener noreferrer"
                class="hero-btn hero-btn--secondary"
              >
                Построить маршрут
              </a>
            </div>

            <!-- Stats -->
            <div class="hero-stats">

              <article class="hero-stat-card">
                <strong>{{ companyInfo.founded }}</strong>
                <span>год основания</span>
              </article>

              <article class="hero-stat-card">
                <strong>60+</strong>
                <span>выставка дверей</span>
              </article>

              <article class="hero-stat-card">
                <strong>10+</strong>
                <span>лет опыта работы</span>
              </article>

            </div>

          </div>

          <!-- RIGHT -->
          <div class="hero-visual">

            <button
              class="hero-main-photo"
              @click="openLightbox(0)"
            >
              <img
                :src="galleryImages[0]?.src"
                :alt="galleryImages[0]?.alt"
                loading="eager"
                decoding="async"
              />

              <div class="hero-main-photo__overlay">
                <span>Смотреть галерею</span>
              </div>
            </button>

            <!-- Floating cards -->
            <div class="floating-card floating-card--top">
              <span class="floating-card__label">
                Адрес
              </span>

              <strong>
                Челябинск, ул. Братьев Кашириных, 131Б (вход с ул. Чичерина)
              </strong>
            </div>

            <div class="floating-card floating-card--bottom">
              <span class="floating-card__label">
                Режим работы
              </span>

              <strong>
                {{ companyInfo.workingHours }}
              </strong>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- ======================================================
         IMAGE LINKS GRID
    ======================================================= -->
    <section class="section section--lg bg-slate-50">
      <div class="container">

        <header
          class="section-header"
          
        >
          <p class="section-eyebrow">
            Пространство салона
          </p>

          <h2 class="section-title">
            Большой выбор 
          </h2>

          <p class="section-lead">
            Обширная экспозиция дверей и перегородок в одном из самых крупных салонов Владимирской фабрики дверей в Челябинске
          </p>
        </header>

        <div class="feature-links">

          <button type="button" class="feature-link feature-link--large" @click="openLightbox(1)">
            <img
              :src="galleryImages[1]?.src"
              :alt="galleryImages[1]?.alt"
              loading="lazy"
            />

            <div class="feature-link__content">
              <span class="feature-link__eyebrow">
                Экспозиция
              </span>

              <h3>
                Большой выставочный зал
              </h3>

              <p>
                Реальные образцы дверей из наличия и под заказ
              </p>
            </div>
          </button>

          <button type="button" class="feature-link" @click="openLightbox(2)">
            <img
              :src="galleryImages[2]?.src"
              :alt="galleryImages[2]?.alt"
              loading="lazy"
            />

            <div class="feature-link__content">
              <span class="feature-link__eyebrow">
                Консультация
              </span>

              <h3>
                Подбор под интерьер
              </h3>
            </div>
          </button>

          <button type="button" class="feature-link" @click="openLightbox(3)">
            <img
              :src="galleryImages[3]?.src"
              :alt="galleryImages[3]?.alt"
              loading="lazy"
            />

            <div class="feature-link__content">
              <span class="feature-link__eyebrow">
                Материалы
              </span>

              <h3>
                Цвета и покрытия
              </h3>
            </div>
          </button>

        </div>

      </div>
    </section>

    <!-- ======================================================
         DIRECTOR
    ======================================================= -->
    <section class="section section--lg">
      <div class="container">

        <div class="director-layout">

          <div class="director-photo-wrap">
            <img
              :src="director.photo"
              :alt="director.name"
              class="director-photo"
              loading="lazy"
            />
          </div>

          <div class="director-content">

            <p class="section-eyebrow">
              Руководитель салона
            </p>

            <h2 class="director-name">
              {{ director.name }}
            </h2>

            <p class="director-position">
              {{ director.position }}
            </p>

            <blockquote class="director-quote">
              {{ director.quote }}
            </blockquote>

            <div class="director-info-grid">

              <div class="director-info-card">
                <strong>{{ director.experience }}</strong>
                <span>опыт в индустрии</span>
              </div>

              <div class="director-info-card">
                <strong>Индивидуальный подход</strong>
                <span>к каждому проекту</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- ======================================================
         GALLERY
    ======================================================= -->
    <section class="section section--lg bg-slate-50">
      <div class="container">

        <header class="section-header">
          <p class="section-eyebrow">
            Галерея
          </p>

          <h2 class="section-title">
            Интерьер салона
          </h2>
        </header>

        <div class="gallery-grid">

          <button
            v-for="(img, index) in galleryImages"
            :key="img.id"
            class="gallery-card"
            @click="openLightbox(index)"
          >
            <img
              :src="img.src"
              :alt="img.alt"
              loading="lazy"
              decoding="async"
              width="480"
              height="600"
            />

            <span class="gallery-card__overlay">
              Открыть фото
            </span>
          </button>

        </div>

      </div>
    </section>

    <!-- ======================================================
         PAYMENT
    ======================================================= -->
    <section class="section section--lg">
      <div class="container">

        <header class="section-header">
          <p class="section-eyebrow">
            Оплата
          </p>

          <h2 class="section-title">
            Удобные способы оплаты
          </h2>
        </header>

        <div class="payment-grid">

          <article
            v-for="method in paymentMethods"
            :key="method.id"
            class="payment-card"
          >
            <div class="payment-card__top">
              <div class="payment-card__icon">
                <img
                  :src="method.iconPath"
                  :alt="method.title"
                  class="payment-card__icon-img"
                  width="28"
                  height="28"
                />
              </div>
            </div>

            <h3 class="payment-card__title">
              {{ method.title }}
            </h3>

            <p class="payment-card__text">
              {{ method.description }}
            </p>
          </article>

        </div>

      </div>
    </section>

    <!-- ======================================================
         REQUISITES
    ======================================================= -->
    <section class="section section--lg bg-slate-50">
      <div class="container">

        <header class="section-header">
          <p class="section-eyebrow">
            Реквизиты
          </p>

          <h2 class="section-title">
            Официальная информация
          </h2>
        </header>

        <div class="requisites-card">

          <div class="requisites-row">
            <span>Наименование</span>
            <strong>{{ requisites.legalName }}</strong>
          </div>

          <div class="requisites-row">
            <span>ИНН</span>
            <strong>{{ requisites.inn }}</strong>
          </div>

          <div class="requisites-row">
            <span>ОГРНИП</span>
            <strong>{{ requisites.ogrnip }}</strong>
          </div>

        </div>

      </div>
    </section>

    <!-- ======================================================
         LIGHTBOX
    ======================================================= -->
    <Teleport v-if="mounted" to="body">

      <div
        v-if="lightboxIndex !== null"
        class="lightbox"
        @click.self="closeLightbox"
      >

        <button
          class="lightbox-close"
          @click="closeLightbox"
        >
          ✕
        </button>

        <button
          class="lightbox-nav lightbox-nav--prev"
          @click="prevImage"
        >
          ‹
        </button>

        <img
          :src="galleryImages[lightboxIndex]?.src"
          :alt="galleryImages[lightboxIndex]?.alt"
          class="lightbox-image"
          decoding="async"
        />

        <button
          class="lightbox-nav lightbox-nav--next"
          @click="nextImage"
        >
          ›
        </button>

      </div>

    </Teleport>

  </div>
</template>

<style scoped>
.about-page {
  background: #ffffff;
  overflow-x: hidden;
}

/* ============================================================
   Shared
============================================================ */
.section-header {
  max-width: 780px;
  margin: 0 auto 4rem;
  text-align: center;
}

.section-eyebrow {
  margin: 0 0 1rem;
  color: #14b8a6;
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.section-title {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.05;
  font-weight: 500;
  letter-spacing: -0.04em;
  color: #0f172a;
}

.section-lead {
  margin: 0 auto;
  max-width: 620px;
  color: #64748b;
  font-size: 1.05rem;
  line-height: 1.7;
}

/* ============================================================
   HERO
============================================================ */
.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 4rem;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: #0f766e;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.hero-title {
  margin: 0;
  font-size: clamp(3rem, 7vw, 5.5rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
  color: #0f172a;
  font-weight: 500;
}

.hero-title span {
  color: #14b8a6;
}

.hero-description {
  margin: 2rem 0;
  max-width: 620px;
  color: #475569;
  font-size: 1.08rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-height: 54px;
  padding: 0 1.5rem;

  border-radius: 16px;

  font-weight: 600;
  text-decoration: none;

  transition:
    transform 200ms ease,
    background 200ms ease,
    border-color 200ms ease;
}

.hero-btn:hover {
  transform: translateY(-2px);
}

.hero-btn--primary {
  background: #14b8a6;
  color: white;
}

.hero-btn--primary:hover {
  background: #0d9488;
}

.hero-btn--secondary {
  border: 1px solid #e2e8f0;
  color: #0f172a;
  background: white;
}

.hero-btn--secondary:hover {
  border-color: #14b8a6;
}

/* Stats */
.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.hero-stat-card {
  padding: 1.25rem;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.hero-stat-card strong {
  display: block;
  font-size: 1.75rem;
  color: #0f172a;
  font-weight: 500;
}

.hero-stat-card span {
  color: #64748b;
  font-size: 0.9rem;
}

/* Hero image */
.hero-visual {
  position: relative;
}

.hero-main-photo {
  width: 100%;
  aspect-ratio: 4/5;
  border: none;
  overflow: hidden;
  border-radius: 32px;
  cursor: pointer;
  background: #e2e8f0;
  position: relative;
}

.hero-main-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;

  transition: transform 700ms ease;
}

.hero-main-photo:hover img {
  transform: scale(1.05);
}

.hero-main-photo__overlay {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: flex-end;

  padding: 2rem;

  background:
    linear-gradient(
      to top,
      rgba(15,23,42,0.7),
      rgba(15,23,42,0)
    );

  color: white;
  font-weight: 600;
  font-size: 1rem;
}

/* Floating cards */
.floating-card {
  position: absolute;

  background: rgba(255,255,255,0.96);

  border: 1px solid rgba(255,255,255,0.5);

  border-radius: 20px;

  padding: 1rem 1.25rem;

  box-shadow:
    0 20px 40px rgba(15,23,42,0.12);
}

.floating-card strong {
  display: block;
  color: #0f172a;
}

.floating-card__label {
  display: block;
  margin-bottom: 0.35rem;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.floating-card--top {
  top: 2rem;
  left: -2rem;
}

.floating-card--bottom {
  right: -2rem;
  bottom: 2rem;
}

/* ============================================================
   IMAGE LINKS
============================================================ */
.feature-links {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 1.25rem;
}

.feature-link {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  min-height: 520px;
  background: #0f172a;
  border: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
  display: block;
  width: 100%;
}

.feature-link img {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;
  object-fit: cover;

  transition: transform 700ms ease;
}

.feature-link:hover img {
  transform: scale(1.06);
}

.feature-link::after {
  content: '';

  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      to top,
      rgba(15,23,42,0.85),
      rgba(15,23,42,0.15)
    );
}

.feature-link__content {
  position: absolute;
  inset: auto 0 0;
  z-index: 2;

  padding: 2rem;

  color: white;
}

.feature-link__eyebrow {
  display: inline-block;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
}

.feature-link h3 {
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
  line-height: 1.1;
}

.feature-link p {
  margin: 0;
  opacity: 0.85;
}

.feature-link--large {
  min-height: 520px;
}

/* ============================================================
   DIRECTOR (ОБНОВЛЕНО)
============================================================ */
.director-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 4rem;
  align-items: center;
}

.director-photo-wrap {
  border-radius: 32px;
  overflow: hidden;
  aspect-ratio: 3/4;
  max-width: 100%;
}

.director-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 22%;
}

.director-name {
  margin: 0 0 0.5rem;
  font-size: 2.6rem;
  line-height: 1.05;
  font-weight: 500;
  color: #0f172a;
}

.director-position {
  margin: 0 0 2rem;
  color: #64748b;
}

.director-quote {
  margin: 0 0 2rem;
  padding: 2rem;

  border-radius: 24px;

  background: #f8fafc;

  border: 1px solid #e2e8f0;

  color: #334155;

  line-height: 1.9;
}

.director-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.director-info-card {
  padding: 1.25rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.director-info-card strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #0f172a;
}

/* ============================================================
   GALLERY
============================================================ */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.gallery-card {
  position: relative;

  border: none;
  border-radius: 24px;

  overflow: hidden;
  cursor: pointer;

  aspect-ratio: 4/5;

  background: #e2e8f0;
}

.gallery-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;

  transition: transform 600ms ease;
}

.gallery-card:hover img {
  transform: scale(1.05);
}

.gallery-card__overlay {
  position: absolute;
  inset: auto 0 0;

  padding: 1.25rem;

  background:
    linear-gradient(
      to top,
      rgba(15,23,42,0.85),
      rgba(15,23,42,0)
    );

  color: white;
  font-weight: 600;
}

/* ============================================================
   PAYMENT
============================================================ */
.payment-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.payment-card {
  padding: 2rem;
  border-radius: 24px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;

  transition:
    transform 250ms ease,
    border-color 250ms ease;
}

.payment-card:hover {
  transform: translateY(-4px);
  border-color: #14b8a6;
}

.payment-card__top {
  margin-bottom: 1.5rem;
}

.payment-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.875rem;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  flex-shrink: 0;
}

.payment-card__icon-img {
  width: 1.625rem;
  height: 1.625rem;
  object-fit: contain;
}

.payment-card__title {
  margin: 0 0 0.75rem;
  color: #0f172a;
  font-size: 1.1rem;
}

.payment-card__text {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

/* ============================================================
   REQUISITES
============================================================ */
.requisites-card {
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid #e2e8f0;
}

.requisites-row {
  display: flex;
  justify-content: space-between;
  gap: 2rem;

  padding: 1.5rem 2rem;

  border-bottom: 1px solid #f1f5f9;
}

.requisites-row:last-child {
  border-bottom: none;
}

.requisites-row span {
  color: #64748b;
}

.requisites-row strong {
  color: #0f172a;
}

/* ============================================================
   LIGHTBOX
============================================================ */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0,0,0,0.92);
}

.lightbox-image {
  max-width: 92vw;
  max-height: 88vh;
  border-radius: 20px;
}

.lightbox-close,
.lightbox-nav {
  position: absolute;

  width: 54px;
  height: 54px;

  border: none;
  border-radius: 999px;

  background: rgba(255,255,255,0.14);

  color: white;

  cursor: pointer;

  font-size: 1.5rem;
}

.lightbox-close {
  top: 2rem;
  right: 2rem;
}

.lightbox-nav--prev {
  left: 2rem;
}

.lightbox-nav--next {
  right: 2rem;
}

/* ============================================================
   Responsive
============================================================ */
@media (max-width: 1200px) {
  .feature-links {
    grid-template-columns: 1fr;
  }

  .feature-link,
  .feature-link--large {
    min-height: 420px;
  }
}

@media (max-width: 1024px) {
  .hero-grid,
  .director-layout {
    grid-template-columns: 1fr;
  }

  .payment-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .floating-card {
    display: none;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: clamp(2.7rem, 12vw, 4rem);
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .payment-grid {
    grid-template-columns: 1fr;
  }

  .director-info-grid {
    grid-template-columns: 1fr;
  }

  .requisites-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* ============================================================
   Reduced motion
============================================================ */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>