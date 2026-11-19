import Image from "next/image";
import Link from "next/link";
import { CroatiaKingdomMapPlate } from "@/components/CroatiaKingdomMapPlate";
import { FadeIn } from "@/components/ui";
import { PageShell } from "@/components/PageShell";
import { PortraitStrokePlate } from "@/components/PortraitStroke";
import { likesContent } from "@/content/likes";
import { identityContent, siteConfig } from "@/content/site";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Home",
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <div id="home-stage" className="relative w-full">
      {/* Map in the RIGHT empty gutter — sibling of the text column, not inside Identity */}
      <CroatiaKingdomMapPlate />
      <PortraitStrokePlate />

      <PageShell className="pt-6 pb-12 sm:pt-8 sm:pb-16">
        {/* Text column only */}
        <div className="mr-auto ml-[max(0rem,calc((100%-42rem)*0.28))] w-full max-w-2xl">
        <div id="home-intro">
        <FadeIn className="pt-2 pb-10 sm:pt-3 sm:pb-12">
          <h1 className="font-display text-5xl leading-[1.05] text-foreground sm:text-6xl">
            {siteConfig.name}
          </h1>

          <div className="rule my-8 max-w-[12rem]" />

          <div className="max-w-xl space-y-4">
            {siteConfig.summaryParagraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className="prose-muted text-[15px]">
                {paragraph.map((segment, segmentIndex) => {
                  const key = `${paragraphIndex}-${segmentIndex}`;
                  if ("bold" in segment && segment.bold) {
                    return (
                      <strong key={key} className="font-semibold text-foreground">
                        {segment.text}
                      </strong>
                    );
                  }
                  if ("href" in segment && segment.href) {
                    return (
                      <Link
                        key={key}
                        href={segment.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="!font-medium !text-accent transition-colors hover:!text-brass"
                      >
                        {segment.text}
                      </Link>
                    );
                  }
                  return <span key={key}>{segment.text}</span>;
                })}
              </p>
            ))}
          </div>
        </FadeIn>
        </div>

        <section
          id="identity"
          className="border-t border-border/80 pt-12 pb-4 sm:pt-14"
          aria-labelledby="identity-heading"
        >
          <FadeIn delay={0.03}>
            <h2
              id="identity-heading"
              className="font-display text-3xl leading-tight text-foreground sm:text-4xl"
            >
              {identityContent.title}
            </h2>
            <div className="mt-4 max-w-xl space-y-4">
              {identityContent.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="prose-muted text-[15px]">
                  {paragraph.map((segment, segmentIndex) =>
                    segment.href ? (
                      <Link
                        key={`${paragraphIndex}-${segmentIndex}`}
                        href={segment.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="!font-medium !text-accent transition-colors hover:!text-brass"
                      >
                        {segment.text}
                      </Link>
                    ) : (
                      <span key={`${paragraphIndex}-${segmentIndex}`}>{segment.text}</span>
                    ),
                  )}
                </p>
              ))}
            </div>
          </FadeIn>
        </section>

        <section
          id="likes"
          className="mt-6 border-t border-border/80 pt-16 pb-10 sm:pt-20"
          aria-labelledby="likes-heading"
        >
          <FadeIn delay={0.04}>
            <h2
              id="likes-heading"
              className="font-display text-3xl leading-tight text-foreground sm:text-4xl"
            >
              {likesContent.title}
            </h2>
            <p className="prose-muted mt-4 max-w-lg text-[15px]">{likesContent.intro}</p>
            <div className="rule mt-8 max-w-[8rem]" />
          </FadeIn>

          <FadeIn delay={0.08} className="mt-12">
            <ul className="space-y-6">
              {likesContent.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 rounded-sm border border-border/80 bg-card/40 p-3 transition hover:border-border-strong hover:bg-card sm:gap-5 sm:p-4"
                  >
                    <div className="relative h-20 w-[7.5rem] shrink-0 overflow-hidden border border-border bg-background sm:h-24 sm:w-40">
                      <Image
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        fill
                        sizes="160px"
                        className="object-cover opacity-90 transition group-hover:opacity-100"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <p className="font-display text-xl text-foreground transition group-hover:text-accent">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-muted">{item.creator}</p>
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle transition group-hover:text-accent">
                        Watch on YouTube
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>
        </section>
      </div>
      </PageShell>
    </div>
  );
}
