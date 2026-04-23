<template>
  <div class="privacy-page">
    <div class="container">
      <div class="privacy-content">
        <h1 class="privacy-content__title">Maxfiylik Siyosati</h1>
        <p class="privacy-content__date">Oxirgi yangilanish: 23 Aprel 2026</p>

        <section class="privacy-section">
          <h2>1. Umumiy ma'lumot</h2>
          <p>
            Bilim Manba (bilimmanba.uz) saytiga xush kelibsiz. Ushbu maxfiylik
            siyosati sizning shaxsiy ma'lumotlaringiz qanday to'planishi,
            ishlatilishi va himoya qilinishini tushuntiradi.
          </p>
        </section>

        <section class="privacy-section">
          <h2>2. To'planadigan ma'lumotlar</h2>
          <p>Biz quyidagi ma'lumotlarni to'playmiz:</p>
          <ul>
            <li>Ro'yxatdan o'tishda: ism, elektron pochta manzili</li>
            <li>Sayt faoliyati: o'qilgan maqolalar, like'lar</li>
            <li>
              Texnik ma'lumotlar: IP manzil, brauzer turi, qurilma ma'lumotlari
            </li>
            <li>Cookie fayllar: sayt sozlamalari va sessiya ma'lumotlari</li>
          </ul>
        </section>

        <section class="privacy-section">
          <h2>3. Ma'lumotlardan foydalanish</h2>
          <p>To'plangan ma'lumotlar quyidagi maqsadlarda ishlatiladi:</p>
          <ul>
            <li>Sayt xizmatlarini taqdim etish va yaxshilash</li>
            <li>Foydalanuvchi hisobini boshqarish</li>
            <li>Sayt statistikasini tahlil qilish</li>
            <li>Reklama xizmatlarini ko'rsatish (Google AdSense)</li>
          </ul>
        </section>

        <section class="privacy-section">
          <h2>4. Cookie fayllar</h2>
          <p>
            Saytimiz cookie fayllardan foydalanadi. Cookie — bu brauzeringizda
            saqlanadigan kichik ma'lumot fayli. Biz quyidagi cookie turlaridan
            foydalanamiz:
          </p>
          <ul>
            <li>
              <strong>Zaruriy cookie'lar:</strong> Sayt ishlashi uchun kerakli
            </li>
            <li>
              <strong>Tahlil cookie'lari:</strong> Google Analytics orqali
              statistika
            </li>
            <li>
              <strong>Reklama cookie'lari:</strong> Google AdSense orqali
              reklama
            </li>
          </ul>
          <p>
            Brauzer sozlamalarida cookie'larni o'chirib qo'yishingiz mumkin,
            lekin bu saytning ba'zi funksiyalarini cheklashi mumkin.
          </p>
        </section>

        <section class="privacy-section">
          <h2>5. Google AdSense va reklama</h2>
          <p>
            Saytimizda Google AdSense reklamalari ko'rsatiladi. Google
            foydalanuvchilarning qiziqishlari asosida reklama ko'rsatish uchun
            cookie fayllardan foydalanadi. Google'ning maxfiylik siyosati bilan
            <a href="https://policies.google.com/privacy" target="_blank">
              bu yerda
            </a>
            tanishishingiz mumkin.
          </p>
        </section>

        <section class="privacy-section">
          <h2>6. Ma'lumotlar xavfsizligi</h2>
          <p>
            Sizning ma'lumotlaringizni himoya qilish uchun zamonaviy xavfsizlik
            texnologiyalaridan foydalanamiz. Parollar shifrlangan holda
            saqlanadi. Biroq, internet orqali ma'lumot uzatish mutlaqo xavfsiz
            emas.
          </p>
        </section>

        <section class="privacy-section">
          <h2>7. Uchinchi tomon xizmatlar</h2>
          <p>Saytimiz quyidagi uchinchi tomon xizmatlardan foydalanadi:</p>
          <ul>
            <li><strong>Google Analytics</strong> — sayt statistikasi</li>
            <li><strong>Google AdSense</strong> — reklama xizmati</li>
            <li><strong>Cloudinary</strong> — rasm saqlash</li>
            <li><strong>Groq AI</strong> — sun'iy intellekt xizmati</li>
          </ul>
        </section>

        <section class="privacy-section">
          <h2>8. Foydalanuvchi huquqlari</h2>
          <p>Sizda quyidagi huquqlar mavjud:</p>
          <ul>
            <li>Shaxsiy ma'lumotlaringizga kirish huquqi</li>
            <li>Ma'lumotlarni o'zgartirish huquqi</li>
            <li>Hisobni o'chirish huquqi</li>
            <li>Ma'lumotlar ishlanishiga e'tiroz bildirish huquqi</li>
          </ul>
        </section>

        <section class="privacy-section">
          <h2>9. Bog'lanish</h2>
          <p>
            Maxfiylik siyosati bo'yicha savollaringiz bo'lsa, biz bilan
            bog'laning:
          </p>
          <ul>
            <li>Email: bilimmanba@outlook.com</li>
            <li>Sayt: bilimmanba.uz</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Maxfiylik Siyosati — Bilim Manba",
  meta: [
    {
      name: "description",
      content:
        "Bilim Manba saytining maxfiylik siyosati va foydalanuvchi ma'lumotlari himoyasi.",
    },
  ],
});
</script>

<style lang="scss" scoped>
.privacy-page {
  padding: 3rem 0 5rem;
}

.privacy-content {
  max-width: 800px;
  margin: 0 auto;

  &__title {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  &__date {
    color: $text-muted;
    font-size: 0.875rem;
    margin-bottom: 2.5rem;
  }
}

.privacy-section {
  margin-bottom: 2rem;

  h2 {
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: $text-primary;
  }

  p {
    font-size: 0.95rem;
    color: $text-secondary;
    line-height: 1.8;
    margin-bottom: 0.75rem;
  }

  ul {
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    li {
      font-size: 0.95rem;
      color: $text-secondary;
      line-height: 1.7;
    }
  }

  a {
    color: $primary;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
