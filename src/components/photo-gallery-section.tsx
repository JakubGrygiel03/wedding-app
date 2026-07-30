"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, Images } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GALLERY_URL =
  process.env.NEXT_PUBLIC_GALLERY_URL?.trim() || "#";

function isGalleryAvailable(url: string) {
  return url !== "#" && url.length > 0;
}

export interface PhotoGallerySectionProps {
  title?: string;
  subtitle?: string;
  galleryUrl?: string;
  className?: string;
}

export function PhotoGallerySection({
  title = "Galeria Wspomnień",
  subtitle = "Zdjęcia z naszego wyjątkowego dnia zostaną udostępnione w tym miejscu niedługo po weselu. Będziecie mogli tu obejrzeć pełny album oraz pobrać kadry na pamiątkę!",
  galleryUrl = GALLERY_URL,
  className,
}: PhotoGallerySectionProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });
  const cardInView = useInView(cardRef, { once: true, margin: "-40px" });
  const galleryAvailable = isGalleryAvailable(galleryUrl);

  return (
    <section
      id="galeria"
      className={cn(
        "relative scroll-mt-20 overflow-hidden px-4 py-10 sm:px-6 sm:py-12",
        className,
      )}
      aria-labelledby="gallery-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_100%,rgba(74,107,93,0.07),transparent),linear-gradient(to_bottom,#faf9f6_0%,#f5f0e8_55%,#faf9f6_100%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl">
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-center sm:mb-8"
        >
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#c9a227]/30 bg-[#1c1917]/5 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#8b6914]">
            <Images className="size-3.5" aria-hidden />
            Galeria
          </div>
          <h2
            id="gallery-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-[#1c1917] sm:text-4xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-base leading-relaxed text-[#4a4540]">
            {subtitle}
          </p>
          <div className="mx-auto mt-4 h-px w-24 bg-linear-to-r from-transparent via-[#c9a227]/50 to-transparent" />
        </motion.header>

        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={cardInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-[#1c1917]/10 bg-card/90 p-6 text-center shadow-[0_12px_40px_-16px_rgba(28,25,23,0.18),inset_0_1px_0_0_rgba(255,255,255,0.6)] backdrop-blur-sm sm:p-8"
        >
          <div
            className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary"
            aria-hidden
          >
            <Camera className="size-6" />
          </div>

          {galleryAvailable ? (
            <a
              href={galleryUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zobacz galerię zdjęć — otwiera się w nowej karcie"
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-11 gap-2 px-6 shadow-[0_8px_24px_-8px_rgba(74,107,93,0.45)] hover:shadow-[0_10px_28px_-8px_rgba(74,107,93,0.55)]",
              )}
            >
              <Camera className="size-4" aria-hidden />
              Zobacz galerię zdjęć
            </a>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                size="lg"
                disabled
                className="min-h-11 gap-2 px-6 opacity-70"
                aria-disabled="true"
              >
                <Camera className="size-4" aria-hidden />
                Zobacz galerię zdjęć
              </Button>
              <p className="text-sm text-[#4a4540]/80">
                Galeria będzie dostępna po weselu
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
