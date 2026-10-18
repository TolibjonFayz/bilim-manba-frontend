/**
 * Ilova sifatida o'rnatish (PWA). Android/Chrome/Edge: brauzer "o'rnatish"
 * oynasini beradi (beforeinstallprompt) — uni tugma bosilganda ochamiz.
 * iPhone/iPad Safari'da bunday oyna yo'q — "Ulashish → Bosh ekranga" yo'riqnomasi.
 */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const deferred = shallowRef<InstallPromptEvent | null>(null);
const installed = ref(false);
let listening = false;

export function usePwa() {
  if (import.meta.client && !listening) {
    listening = true;
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
    });
  }

  const isIos = computed(
    () =>
      import.meta.client &&
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !installed.value,
  );
  const canInstall = computed(
    () => !installed.value && (Boolean(deferred.value) || isIos.value),
  );

  /** true — o'rnatildi; false — rad etildi; "ios" — yo'riqnoma ko'rsatish kerak */
  const install = async (): Promise<boolean | "ios"> => {
    if (deferred.value) {
      const e = deferred.value;
      deferred.value = null;
      await e.prompt();
      const { outcome } = await e.userChoice;
      return outcome === "accepted";
    }
    return isIos.value ? "ios" : false;
  };

  return { canInstall, isIos, installed, install };
}
