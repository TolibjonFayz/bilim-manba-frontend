<template>
  <div class="faq-page">
    <div class="container">
      <!-- Header -->
      <div class="faq-header">
        <h1 class="faq-header__title">Ko'p so'raladigan savollar</h1>
        <p class="faq-header__subtitle">
          Savollaringizga javob topa olmadingizmi? Biz bilan bog'laning!
        </p>
      </div>

      <!-- FAQ list -->
      <div class="faq-list">
        <div
          v-for="(item, i) in faqs"
          :key="i"
          class="faq-item"
          :class="{ 'faq-item--open': openIndex === i }"
          @click="toggle(i)"
        >
          <div class="faq-item__question">
            <span>{{ item.question }}</span>
            <span class="faq-item__icon">
              {{ openIndex === i ? "−" : "+" }}
            </span>
          </div>
          <div v-if="openIndex === i" class="faq-item__answer">
            {{ item.answer }}
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="faq-cta">
        <h3>Savolingiz javobsiz qoldimi?</h3>
        <p>Biz bilan bog'laning, 24 soat ichida javob beramiz</p>
        <a href="mailto:bilimmanba@outlook.com" class="btn btn--primary">
          Biz bilan bog'laning →
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Ko'p so'raladigan savollar — Bilim Manba",
  meta: [
    {
      name: "description",
      content:
        "Bilim Manba haqida ko'p so'raladigan savollar va ularga javoblar.",
    },
  ],
});

const openIndex = ref<number | null>(null);

const toggle = (i: number) => {
  openIndex.value = openIndex.value === i ? null : i;
};

const faqs = [
  {
    question: "Bilim Manba nima?",
    answer:
      "Bilim Manba — o'zbek tilida ilm-fan, texnologiya, matematika va boshqa sohalardagi maqolalar platformasi. Maqolalarni bepul o'qishingiz, like bosishingiz va AI yordamida tushuntirishlar olishingiz mumkin.",
  },
  {
    question: "Ro'yxatdan o'tish majburiyatimi?",
    answer:
      "Maqolalarni o'qish uchun ro'yxatdan o'tish shart emas. Lekin like bosish, maqolalarni saqlash va AI yordamchidan foydalanish uchun ro'yxatdan o'tishingiz kerak bo'ladi.",
  },
  {
    question: "Sayt to'liq bepulmi?",
    answer:
      "Ha, Bilim Manba saytining barcha maqolalari va funksiyalari hozirda to'liq bepul. Ro'yxatdan o'tish ham, maqolalarni o'qish ham pullik emas.",
  },
  {
    question: "AI yordamchi qanday ishlaydi?",
    answer:
      "Har bir maqola sahifasida '🤖 AI tushuntirsin' tugmasi mavjud. Uni bosib, maqola bo'yicha savollaringizni yozishingiz mumkin. AI o'zbek tilida qisqa va tushunarli javob beradi.",
  },
  {
    question: "Saqlangan maqolalarni qayerda ko'rish mumkin?",
    answer:
      "Maqolada like (❤️) bosgandan so'ng, u Profil sahifasidagi 'Saqlangan' tabida saqlanadi. Istalgan vaqt qaytib o'qishingiz mumkin.",
  },
  {
    question: "Parolimni unutdim, nima qilaman?",
    answer:
      "Hozircha parolni tiklash funksiyasi ishlab chiqilmoqda. Muammo yuzaga kelsa, bilimmanba@outlook.com manziliga xat yuboring — 24 soat ichida yordam beramiz.",
  },
  {
    question: "Yangi maqolalar qachon qo'shiladi?",
    answer:
      "Maqolalar muntazam ravishda qo'shib boriladi. Yangi maqolalardan xabardor bo'lish uchun saytni kuzatib boring.",
  },
  {
    question: "Saytda xato yoki muammo topilsa nima qilaman?",
    answer:
      "bilimmanba@outlook.com manziliga xabar yuboring. Muammoni tezkor hal qilamiz. Sizning fikr-mulohazalaringiz saytni yaxshilashga yordam beradi!",
  },
];
</script>

<style lang="scss" scoped>
.faq-page {
  padding: 3rem 0 5rem;
}

.faq-header {
  text-align: center;
  margin-bottom: 3rem;

  &__title {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
  }

  &__subtitle {
    font-size: 1rem;
    color: $text-secondary;
  }
}

.faq-list {
  max-width: 720px;
  margin: 0 auto 3rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  background: #fff;
  border: 1.5px solid $border-color;
  border-radius: $border-radius;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba($primary, 0.4);
  }

  &--open {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.08);
  }

  &__question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    font-weight: 600;
    font-size: 0.95rem;
    color: $text-primary;
    gap: 1rem;
  }

  &__icon {
    font-size: 1.25rem;
    color: $primary;
    font-weight: 700;
    flex-shrink: 0;
  }

  &__answer {
    padding: 0 1.5rem 1.25rem;
    font-size: 0.9rem;
    color: $text-secondary;
    line-height: 1.8;
    border-top: 1px solid $border-color;
    padding-top: 1rem;
  }
}

.faq-cta {
  text-align: center;
  background: $bg-secondary;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  padding: 2.5rem;
  max-width: 720px;
  margin: 0 auto;

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  p {
    color: $text-secondary;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
}
</style>
