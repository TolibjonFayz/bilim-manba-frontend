<template>
  <div class="terms-page">
    <div class="container">
      <div class="terms-content">
        <h1 class="terms-content__title">Foydalanish Shartlari</h1>
        <p class="terms-content__date">Oxirgi yangilanish: 23 Aprel 2026</p>

        <section class="terms-section">
          <h2>1. Umumiy qoidalar</h2>
          <p>
            Bilim Manba (bilimmanba.uz) saytidan foydalanish orqali siz ushbu
            foydalanish shartlariga to'liq roziligingizni bildirasiz. Agar
            shartlarga rozi bo'lmasangiz, saytdan foydalanmang.
          </p>
        </section>

        <section class="terms-section">
          <h2>2. Ro'yxatdan o'tish</h2>
          <p>
            Saytdan to'liq foydalanish uchun ro'yxatdan o'tish talab etiladi:
          </p>
          <ul>
            <li>To'g'ri va haqiqiy ma'lumotlarni kiritishingiz shart</li>
            <li>Hisobingiz xavfsizligi uchun o'zingiz javobgarsiz</li>
            <li>Bir kishi faqat bitta hisob ochishi mumkin</li>
            <li>
              18 yoshdan kichik foydalanuvchilar ota-ona ruxsati bilan
              foydalanishi mumkin
            </li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>3. Foydalanuvchi majburiyatlari</h2>
          <p>Saytdan foydalanishda quyidagilarga amal qilishingiz shart:</p>
          <ul>
            <li>Boshqa foydalanuvchilarga hurmat bilan munosabatda bo'lish</li>
            <li>
              Sayt kontent va funksiyalarini noto'g'ri maqsadlarda ishlatmaslik
            </li>
            <li>Saytga zarar yetkazadigan harakatlar qilmaslik</li>
            <li>Boshqalarning shaxsiy ma'lumotlarini tarqatmaslik</li>
            <li>Mualliflik huquqiga rioya qilish</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>4. Kontent va mualliflik huquqi</h2>
          <p>
            Bilim Manba saytidagi barcha maqolalar, rasmlar va boshqa
            materiallar mualliflik huquqi bilan himoyalangan. Ruxsatsiz nusxa
            ko'chirish yoki tarqatish taqiqlanadi.
          </p>
          <ul>
            <li>Maqolalarni shaxsiy foydalanish uchun o'qishingiz mumkin</li>
            <li>
              Manba ko'rsatgan holda kichik parchalarni ulashishingiz mumkin
            </li>
            <li>Tijorat maqsadida foydalanish uchun ruxsat olish shart</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>5. Taqiqlangan harakatlar</h2>
          <p>Quyidagi harakatlar qat'iyan taqiqlanadi:</p>
          <ul>
            <li>Saytga kirishni buzishga urinish (hacking)</li>
            <li>Avtomatik bot orqali saytdan ma'lumot yig'ish (scraping)</li>
            <li>Spam yuborish yoki reklama qilish</li>
            <li>Noto'g'ri yoki yolg'on ma'lumot tarqatish</li>
            <li>Boshqa foydalanuvchilarni aldash yoki xafa qilish</li>
            <li>Qonunlarga zid harakatlar qilish</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>6. Hisobni bloklash</h2>
          <p>
            Quyidagi hollarda foydalanuvchi hisobi ogohlantirishsiz bloklanishi
            mumkin:
          </p>
          <ul>
            <li>Foydalanish shartlarini buzish</li>
            <li>Saytga zarar yetkazishga urinish</li>
            <li>Boshqa foydalanuvchilarga zarar yetkazish</li>
            <li>Qonunbuzarlik hollari</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2>7. Mas'uliyatni cheklash</h2>
          <p>
            Bilim Manba saytidagi maqolalar faqat ma'lumot berish maqsadida
            yozilgan. Sayt ma'muriyati maqolalardagi ma'lumotlarning to'liqligi
            va aniqligi uchun to'liq javobgarlikni o'z zimmaga olmaydi.
          </p>
        </section>

        <section class="terms-section">
          <h2>8. Xizmat o'zgarishlari</h2>
          <p>
            Bilim Manba istalgan vaqtda xizmat shartlarini o'zgartirish,
            xizmatlarni to'xtatish yoki yangi funksiyalar qo'shish huquqini
            o'zida saqlab qoladi. O'zgarishlar saytda e'lon qilinadi.
          </p>
        </section>

        <section class="terms-section">
          <h2>9. Qo'llaniladigan qonunlar</h2>
          <p>
            Ushbu foydalanish shartlari O'zbekiston Respublikasining amaldagi
            qonunlari asosida tartibga solinadi.
          </p>
        </section>

        <section class="terms-section">
          <h2>10. Bog'lanish</h2>
          <p>
            Foydalanish shartlari bo'yicha savollaringiz bo'lsa, biz bilan
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
  title: "Foydalanish Shartlari — Bilim Manba",
  meta: [
    {
      name: "description",
      content: "Bilim Manba saytidan foydalanish shartlari va qoidalari.",
    },
  ],
});
</script>

<style lang="scss" scoped>
.terms-page {
  padding: 3rem 0 5rem;
}

.terms-content {
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

.terms-section {
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
}
</style>
