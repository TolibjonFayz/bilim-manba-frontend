<template>
  <div class="privacy-page">
    <div class="container">
      <div class="privacy-content">
        <h1 class="privacy-content__title">Maxfiylik Siyosati</h1>
        <p class="privacy-content__date">Oxirgi yangilanish: 1-oktabr 2026</p>

        <section class="privacy-section">
          <h2>1. Biz kimmiz</h2>
          <p>
            Bilim Manba (bilimmanba.uz) — Toshkentdagi mustaqil
            <a href="https://tong-inc.pages.dev/uz" target="_blank" rel="noopener"
              >TONG INC</a
            >
            studiyasi yaratgan va boshqaradigan o'zbek tilidagi bilim
            platformasi. Ushbu siyosat saytda qanday ma'lumot yig'ilishi, nima
            uchun ishlatilishi va qanday himoya qilinishini tushuntiradi.
          </p>
        </section>

        <section class="privacy-section">
          <h2>2. Hisobsiz foydalanish</h2>
          <p>
            Maqolalarni o'qish uchun ro'yxatdan o'tish shart emas. Hisob faqat
            izoh qoldirish, maqolalarni saqlash va yoqtirish hamda sun'iy
            intellektdan cheklovsiz foydalanish uchun kerak.
          </p>
        </section>

        <section class="privacy-section">
          <h2>3. Qanday ma'lumot yig'iladi</h2>
          <ul>
            <li>
              <strong>Ro'yxatdan o'tsangiz:</strong> ism, email manzil va parol.
              Parol ochiq holda saqlanmaydi — faqat qaytarib bo'lmaydigan
              shifrlangan (xesh) ko'rinishda.
            </li>
            <li>
              <strong>Saytdagi faoliyatingiz (hisob bilan):</strong> izohlaringiz,
              yoqtirgan va saqlagan maqolalaringiz, o'qigan maqolalaringiz soni
              va bildirishnomalar.
            </li>
            <li>
              <strong>Yangiliklarga obuna bo'lsangiz:</strong> email manzilingiz —
              faqat yangi maqolalar haqida xat yuborish uchun.
            </li>
            <li>
              <strong>Texnik ma'lumotlar:</strong> IP manzil va brauzer turi
              server jurnallarida xavfsizlik uchun qayd etilishi mumkin.
              Mehmonlarning sun'iy intellekt savollari kunlik limiti IP bo'yicha
              hisoblanadi; bu hisob faqat server xotirasida turadi va har kuni
              tozalanadi.
            </li>
          </ul>
        </section>

        <section class="privacy-section">
          <h2>4. Sun'iy intellekt ("AI tushuntirsin")</h2>
          <p>
            Bu tugmani ishlatganingizda savolingiz va maqola matni javob olish
            uchun Groq sun'iy intellekt xizmatiga yuboriladi. Biz savollaringizni
            o'z serverimizda saqlamaymiz. Savollarga shaxsiy ma'lumot
            (telefon, manzil va hokazo) yozmang.
          </p>
        </section>

        <section class="privacy-section">
          <h2>5. Cookie va brauzer xotirasi</h2>
          <ul>
            <li>
              <strong>Kirish ma'lumoti:</strong> tizimga kirganingizda kirish
              kaliti brauzeringiz xotirasida (localStorage) saqlanadi.
              "Chiqish" tugmasi uni o'chiradi.
            </li>
            <li>
              <strong>Statistika:</strong> Google Analytics tashriflarni hisoblash
              uchun cookie ishlatadi. Vercel Analytics esa cookie'siz ishlaydi.
            </li>
          </ul>
          <p>
            Hozirda saytda reklama ko'rsatilmaydi. Reklama qo'shilsa, bu
            siyosat oldindan yangilanadi.
          </p>
        </section>

        <section class="privacy-section">
          <h2>6. Ma'lumotlardan foydalanish</h2>
          <ul>
            <li>Sayt xizmatlarini ko'rsatish va hisobingizni yuritish</li>
            <li>Parolni tiklash va siz obuna bo'lgan xatlarni yuborish</li>
            <li>Qaysi maqolalar o'qilishini bilib, saytni yaxshilash</li>
          </ul>
          <p>Biz shaxsiy ma'lumotlaringizni hech kimga sotmaymiz.</p>
        </section>

        <section class="privacy-section">
          <h2>7. Ma'lumotlar xavfsizligi</h2>
          <p>
            Sayt faqat HTTPS orqali ishlaydi, parollar xesh ko'rinishda
            saqlanadi, baza har kuni shifrlangan holda zaxiralanadi. Shunday
            bo'lsa-da, internet orqali ma'lumot uzatish hech qachon 100% xavfsiz
            emas.
          </p>
        </section>

        <section class="privacy-section">
          <h2>8. Uchinchi tomon xizmatlar</h2>
          <p>Sayt ishlashi uchun quyidagi xizmatlardan foydalanamiz:</p>
          <ul>
            <li><strong>Vercel</strong> — sayt hostingi va Vercel Analytics</li>
            <li><strong>Render</strong> — server (API)</li>
            <li><strong>Neon</strong> — ma'lumotlar bazasi</li>
            <li>
              <strong>Cloudflare R2</strong> — maqola matnlari va shifrlangan
              zaxira nusxalar
            </li>
            <li><strong>Cloudinary</strong> — rasmlar</li>
            <li><strong>Google Analytics</strong> — tashriflar statistikasi</li>
            <li><strong>Groq</strong> — sun'iy intellekt javoblari</li>
          </ul>
        </section>

        <section class="privacy-section">
          <h2>9. Sizning huquqlaringiz</h2>
          <p>
            Ma'lumotlaringizni ko'rish, tuzatish yoki hisobingizni butunlay
            o'chirishni so'rashingiz mumkin. Ro'yxatdan o'tgan email
            manzilingizdan bilimmanba@gmail.com ga yozing — so'rovni 30 kun
            ichida bajaramiz.
          </p>
        </section>

        <section class="privacy-section">
          <h2>10. Bog'lanish</h2>
          <ul>
            <li>Email: bilimmanba@gmail.com</li>
            <li>Sayt egasi: TONG INC, Toshkent, O'zbekiston</li>
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
        "Bilim Manba (TONG INC) maxfiylik siyosati: qanday ma'lumot yig'iladi, nima uchun ishlatiladi va qanday himoya qilinadi.",
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
