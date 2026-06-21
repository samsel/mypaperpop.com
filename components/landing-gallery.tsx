import Image from 'next/image';
import { galleryItems } from '@/lib/landing-data';
import { Reveal } from '@/components/reveal';

export function LandingGallery() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal className="reveal-fade-up">
          <h2 className="mb-4 text-center font-display text-4xl text-[var(--ink)] sm:text-5xl">
            Endless possibilities
          </h2>
          <p className="mb-12 text-center text-base text-[var(--ink)]/55">
            If they can imagine it, we can sketch it.
          </p>
        </Reveal>
        <Reveal className="reveal-stagger-scale">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {galleryItems.map((item, index) => (
              <div
                key={item.src}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg border-[1.5px] border-[var(--ink)] bg-white">
                  <Image
                    src={item.src}
                    alt={item.label}
                    width={item.width}
                    height={item.height}
                    sizes="(min-width: 640px) 33vw, 50vw"
                    quality={80}
                    priority={index < 3}
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="absolute bottom-0 left-0 right-0 px-4 py-3 text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
