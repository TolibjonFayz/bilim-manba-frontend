/**
 * Ilova sifatida o'rnatish (PWA).
 *  - Chrome/Edge brauzeri "o'rnatish" oynasini bersa (beforeinstallprompt) —
 *    tugma uni ochadi.
 *  - Bermasa (Chrome uni saytda biroz vaqt o'tgach beradi; iPhone'da umuman
 *    yo'q) — o'sha brauzer uchun qisqa yo'riqnoma ko'rsatiladi
 *    (<InstallGuide /> — app.vue'da bitta).
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type PwaPlatform =
  | "ios"
  | "android-chrome"
  | "android-edge"
  | "android-samsung"
  | "android-other"
  | "desktop";

const deferred = shallowRef<InstallPromptEvent | null>(null);
const installed = ref(false);
const platform = ref<PwaPlatform>("desktop");
const guideOpen = ref(false);
let listening = false;

const detect = (ua: string): PwaPlatform => {
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) {
    if (/EdgA\//.test(ua)) return "android-edge";
    if (/SamsungBrowser/i.test(ua)) return "android-samsung";
    if (/Chrome\//.test(ua) && !/; wv\)|Telegram|Instagram|FBAN|FBAV/i.test(ua))
      return "android-chrome";
    return "android-other";
  }
  return "desktop";
};

export function usePwa() {
  if (import.meta.client && !listening) {
    listening = true;
    platform.value = detect(navigator.userAgent);
    installed.value =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferred.value = e as InstallPromptEvent;
    });
    window.addEventListener("appinstalled", () => {
      installed.value = true;
      deferred.value = null;
      guideOpen.value = false;
    });
  }

  // Telefonda doim (yo'riqnoma bilan), kompyuterda — brauzer taklif qilsa
  const canInstall = computed(
    () =>
      !installed.value &&
      (Boolean(deferred.value) || platform.value !== "desktop"),
  );

  const install = async () => {
    if (deferred.value) {
      const e = deferred.value;
      deferred.value = null;
      await e.prompt();
      const { outcome } = await e.userChoice;
      return outcome === "accepted";
    }
    guideOpen.value = true;
    return false;
  };

  return { canInstall, installed, platform, guideOpen, install };
}
