/**
 * Storyblok Image Service helpers.
 *
 * Assets uploaded to the CMS are served at their original size unless we ask
 * for a transform, so a 1080×1080 photo shown in a 400px slot ships four times
 * the pixels it needs. These helpers build the transform URLs (resize + webp +
 * quality) and recover the intrinsic dimensions, which go on the <img> as
 * width/height so the browser reserves the right box and the layout doesn't
 * shift while the image loads (Lighthouse CLS).
 *
 * Non-Storyblok URLs (e.g. the placeholder defaults) pass through untouched —
 * the image service only exists for a.storyblok.com.
 */

const isStoryblok = (url: string): boolean =>
  url.includes('a.storyblok.com') && !url.endsWith('.svg');

/**
 * Resized, webp-encoded variant. `height` 0 keeps the aspect ratio.
 * `smart` crops toward the subject when both dimensions are given.
 */
export function storyblokImage(url: string, width: number, height = 0): string {
  if (!isStoryblok(url)) return url;
  const crop = height > 0 ? '/smart' : '';
  return `${url}/m/${width}x${height}${crop}/filters:format(webp):quality(80)`;
}

/** `srcset` from width descriptors, e.g. [640, 1024] → "url 640w, url 1024w". */
export function storyblokSrcSet(url: string, widths: number[], height = 0): string {
  if (!isStoryblok(url)) return '';
  return widths
    .map((w) => {
      const h = height > 0 ? Math.round((height / widths[0]) * w) : 0;
      return `${storyblokImage(url, w, h)} ${w}w`;
    })
    .join(', ');
}

/**
 * Intrinsic size, read from the asset path (.../f/<space>/<W>x<H>/<hash>/name.jpg).
 * Returns null for non-Storyblok URLs or an unexpected shape.
 */
export function storyblokSize(url: string): { width: number; height: number } | null {
  const match = url.match(/\/(\d+)x(\d+)\//);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return width > 0 && height > 0 ? { width, height } : null;
}
