/**
 * Cloudinary rasmini kerakli kenglikda, avtomatik format (WebP/AVIF)
 * va sifatda qaytaradi. Asl muqovalar 1.3 MB gacha — kartochkaga 30 KB yetadi.
 * Cloudinary bo'lmagan URL o'zgarishsiz qaytadi.
 */
export function cldImg(url: string | null | undefined, width: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/"))
    return url;
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_limit,w_${width}/`,
  );
}

/** Responsive `srcset` — brauzer ekranga mosini o'zi tanlaydi. */
export function cldSrcset(
  url: string | null | undefined,
  widths: number[],
): string | undefined {
  if (!url || !url.includes("res.cloudinary.com")) return undefined;
  return widths.map((w) => `${cldImg(url, w)} ${w}w`).join(", ");
}
