<template>
  <footer class="footer">
    <div class="footer__main container">
      <div class="footer__brand">
        <div class="footer__logo">
          <img
            src="https://res.cloudinary.com/dne7ddv2a/image/upload/f_auto/c_scale,w_1000/v1776068517/Logo_no_text_transparent_uytuse.png"
            alt="Bilim Manba"
            class="footer__logo-img"
          />
          <span>Bilim Manba</span>
        </div>
        <p class="footer__desc">
          O'zbekistondagi eng yirik o'quv platformasi. Bilimni sifatli maqolalar
          orqali ulashing va qabul qiling.
        </p>
        <div class="footer__socials">
          <a href="https://t.me/bilim_manba" class="footer__social">
            <Icon name="logos:telegram" size="1em" mode="css" />
          </a>
          <a href="https://www.instagram.com/bilimmanba" class="footer__social">
            <Icon name="skill-icons:instagram" size="1em" mode="css" />
          </a>
        </div>
      </div>

      <div class="footer__col">
        <h4>Platforma</h4>
        <NuxtLink to="/">Bosh sahifa</NuxtLink>
        <NuxtLink to="/articles">Maqolalar</NuxtLink>
        <NuxtLink to="/categories">Kategoriyalar</NuxtLink>
      </div>

      <div class="footer__col">
        <h4>Yordam</h4>
        <a href="#">FAQ</a>
        <a href="#">Blog</a>
        <a href="#">Qo'llab-quvvatlash</a>
        <a href="#">Maxfiylik siyosati</a>
      </div>

      <div class="footer__col footer__subscribe">
        <h4>Yangiliklarga obuna bo'ling</h4>
        <p>Eng yangi maqolalar va yangiliklar haqida xabardor bo'ling.</p>
        <div class="footer__subscribe-form">
          <input type="email" placeholder="Email manzilingiz" />
          <button class="btn btn--primary">Obuna bo'lish</button>
        </div>
      </div>
    </div>

    <div class="footer__bottom container">
      <span>© 2026 Bilim Manba. Barcha huquqlar himoyalangan.</span>
      <span>Toshkent, O'zbekiston · bilimmanba@outlook.com</span>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background: $bg-secondary;
  border-top: 1px solid $border-color;
  margin-top: 5rem;

  &__main {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 2fr;
    gap: 3rem;
    // padding shorthand would zero out .container's horizontal padding (specificity bug)
    // so use top/bottom only — let .container handle left/right
    padding-top: 4rem;
    padding-bottom: 4rem;

    @media (max-width: $tablet) {
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding-top: 3rem;
      padding-bottom: 3rem;
    }

    @media (max-width: $mobile) {
      grid-template-columns: 1fr;
      gap: 2rem;
      padding-top: 2.5rem;
      padding-bottom: 2.5rem;
    }
  }

  &__logo-img {
    width: 50px;
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1.1rem;
  }

  &__desc {
    font-size: 0.875rem;
    color: $text-secondary;
    line-height: 1.6;
  }

  &__socials {
    display: flex;
    gap: 0.75rem;
  }

  &__social {
    font-size: 1.25rem;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    h4 {
      font-weight: 700;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
    }

    a {
      font-size: 0.875rem;
      color: $text-secondary;
      transition: color 0.15s;

      &:hover {
        color: $primary;
      }
    }
  }

  &__subscribe {
    gap: 0.75rem;

    p {
      font-size: 0.875rem;
      color: $text-secondary;
    }

    &-form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      input {
        width: 100%; // stretch to container width
        padding: 0.65rem 1rem;
        border: 1.5px solid $border-color;
        border-radius: $border-radius-pill;
        font-size: 0.875rem;
        outline: none;
        background: #fff;
        box-sizing: border-box;

        &:focus {
          border-color: $primary;
        }
      }

      // Subscribe button stretches full-width in column flex
      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    // same fix: avoid shorthand that zeroes .container horizontal padding
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    border-top: 1px solid $border-color;
    font-size: 0.8rem;
    color: $text-muted;

    @media (max-width: $mobile) {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
  }
}
</style>
