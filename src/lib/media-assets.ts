/**
 * Single source of truth for on-site photos.
 * Sections must import from here instead of copying files per block.
 * Post-wedding gallery stays on an external album so Vercel/Supabase storage
 * is not filled with full-resolution photographer files.
 */

export const MEDIA_ASSETS = {
  heroBackground: "/hero-loch-hourn.jpg",
  story: {
    meeting: "/story/erk-1536.jpg",
    souls: "/story/rekografia-0324.jpg",
    scotland: "/story/step-3-proposal.png",
    ring: "/story/step-4-ring.png",
    wedding: "/story/step-5-village.png",
  },
} as const;

/** Next/Image quality — smaller decoded payload on phones. */
export const SITE_IMAGE_QUALITY = 70;

export function getPublicGalleryUrl(): string {
  return process.env.NEXT_PUBLIC_GALLERY_URL?.trim() || "";
}
