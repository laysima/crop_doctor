import Image from "next/image";
import type { ReactNode } from "react";

// Point this at the camera screen (for example "/scan") once the app exists.
const APP_HREF = "#get-the-app";
// Placeholder: replace with the real partnerships inbox.
const PARTNER_EMAIL = "partners@example.com";

const NAV = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#why-trust-it", label: "Why trust it" },
  { href: "#partners", label: "For partners" },
];

const TARGETS = [
  { value: "30 sec", label: "From photo to first opinion, even on 3G" },
  { value: "300 KB", label: "Most a photo uses when it is sent" },
  { value: "Top 3", label: "Likely causes, never one certain answer" },
  { value: "No signal", label: "Scans wait and send when signal returns" },
];

const FEATURES = [
  {
    title: "Cheap, safe steps first",
    body: "Remove infected leaves, adjust watering, rotate crops. Products come after, and only ones registered in your region.",
  },
  {
    title: "Voice at every step",
    body: "Results are read aloud, and you can speak your answers instead of typing them.",
  },
  {
    title: "Built for weak signal",
    body: "Installs from the browser, runs on low-end Android phones, and keeps past results and crop guides offline.",
  },
  {
    title: "Says when it is unsure",
    body: "When confidence is low it tells you plainly, holds back on chemicals, and shows how to reach an extension officer.",
  },
];

const TRUST = [
  {
    image: "/images/robot-seedlings.jpg",
    position: "object-[30%_50%]",
    height: "lg:h-[460px]",
    title: "AI reads the photo",
    body: "Gemini vision looks for visible symptoms and suggests up to three likely causes, with confidence in plain words.",
    tags: ["Top 3 causes", "Plain confidence"],
  },
  {
    image: "/images/vertical-farm.jpg",
    position: "object-center",
    height: "lg:h-[540px]",
    title: "Vetted sources write the advice",
    body: "Treatment text, products and dosages come from a reviewed knowledge base, never from free AI generation.",
    tags: ["Reviewed", "Region registered"],
  },
  {
    image: "/images/rooftop-garden.jpg",
    position: "object-[60%_100%]",
    height: "lg:h-[620px]",
    title: "People handle the hard cases",
    body: "Unclear or fast-spreading problems go to a human. Every chemical comes with protective-equipment and pre-harvest warnings.",
    tags: ["Officer contact", "Safety warnings"],
  },
];

const FAQS = [
  {
    q: "How accurate is it?",
    a: "It gives a first opinion, not a laboratory diagnosis. We test on agronomist-labelled photos from real fields, and the pilot target is the right cause in the top three at least 80% of the time. Some viruses and soil problems cannot be told apart from one photo, and the app says so.",
  },
  {
    q: "How is chemical advice kept safe?",
    a: "Products come only from a reviewed knowledge base. Anything banned or unregistered in the region is removed, every chemical carries protective-equipment and pre-harvest-interval warnings, and low-confidence results never recommend chemicals.",
  },
  {
    q: "What happens to farmers' photos and data?",
    a: "Farmers give consent before photos or location are stored. Location stays at district level, data is deleted on request and never sold, and anything shown in reports is aggregated and anonymised.",
  },
  {
    q: "How does a pilot run?",
    a: "One cooperative, about 200 farmers, one growing season. Extension officers review a sample of results, and we track accuracy, helpfulness, treatment outcomes and cost per diagnosis.",
  },
  {
    q: "Does it replace extension officers?",
    a: "No. It helps farmers act sooner on common problems and sends the hard cases to officers, whose time is the scarcest resource in the system.",
  },
];

const INSTALL = [
  {
    device: "Android",
    steps: ["Open this page in Chrome", "Tap Open app", "Choose Add to Home screen"],
    note: "Works offline from its own icon.",
  },
  {
    device: "iPhone",
    steps: ["Open this page in Safari", "Tap the Share button", "Choose Add to Home Screen"],
    note: "Saved scans may clear after long periods without use.",
  },
  {
    device: "Computer",
    steps: ["Crop Doctor is made for phones", "Open this page on your phone", "Or ask your cooperative for the link"],
    note: "Officers can help the first time at farmer meetings.",
  },
];

function Arrow({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 text-[17px] font-semibold tracking-tight ${className}`}>
      <span className="grid size-8 place-items-center rounded-full bg-ink text-lime">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-[18px]">
          <path d="M4 16c0-7 4-12 12.5-12.5C16.5 12 11 16 4 16Z" fill="currentColor" />
          <path d="M10.2 7.4v5M7.7 9.9h5" stroke="#12291f" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      Crop Doctor
    </span>
  );
}

function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime px-6 text-[15px] font-medium text-ink transition-colors hover:bg-[#d8e64a]"
    >
      {children}
      <Arrow />
    </a>
  );
}

function SectionHeading({ label, children, center = false, invert = false }: { label: string; children: ReactNode; center?: boolean; invert?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`text-[15px] ${invert ? "text-white/75" : "text-muted"}`}>{label}</p>
      <h2 className={`mt-3 text-balance text-[34px] leading-[1.08] font-medium tracking-[-0.035em] sm:text-[44px] ${invert ? "text-white" : ""}`}>
        {children}
      </h2>
    </div>
  );
}

function Hero() {
  return (
    <div className="p-2 sm:p-3">
      <section className="relative isolate flex min-h-[calc(100svh-16px)] flex-col overflow-hidden rounded-[20px] p-3 text-white sm:min-h-[720px] sm:rounded-[28px] sm:p-5 lg:h-[calc(100svh-24px)] lg:max-h-[880px]">
        <Image
          src="/images/field-rows.jpg"
          alt="Young crop plants growing in rows of dark soil, lit by low sun"
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover object-[32%_100%] sm:object-[50%_100%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/40 to-ink/80" />

        <nav aria-label="Main" className="flex items-center justify-between rounded-full bg-bone py-2 pr-2 pl-3 text-ink">
          <a href="#top" aria-label="Crop Doctor home">
            <Logo />
          </a>
          <div className="hidden items-center gap-8 text-sm md:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-opacity hover:opacity-60">
                {item.label}
              </a>
            ))}
          </div>
          <a
            href={APP_HREF}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-medium transition-colors hover:bg-[#d8e64a]"
          >
            Open app
            <Arrow />
          </a>
        </nav>

        <div id="top" className="flex flex-1 flex-col justify-between gap-10 px-2 pt-12 pb-3 sm:px-6 sm:pt-16 sm:pb-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-sm backdrop-blur-sm">
              A first opinion for sick crops
            </p>
            <h1 className="mt-5 text-balance text-[44px] leading-[1.02] font-medium tracking-[-0.045em] sm:text-[68px] lg:text-[80px]">
              Photograph a sick plant. Hear what to do.
            </h1>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="w-full max-w-[290px] rounded-2xl border border-white/20 bg-ink/55 p-4 backdrop-blur-md">
              <p className="text-xs text-white/75">Example result</p>
              <p className="mt-1.5 text-[17px] font-medium tracking-tight">Likely maize streak virus</p>
              <p className="mt-1 text-sm text-white/80">Could also be nutrient deficiency</p>
              <p className="mt-3 inline-flex rounded-full bg-lime px-2.5 py-1 text-xs font-medium text-ink">Medium confidence</p>
            </div>

            <div className="max-w-md">
              <p className="text-[17px] leading-snug text-white/95">
                Crop Doctor gives smallholder farmers a likely diagnosis and low-cost treatment options, in their own language, by voice or text.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <PrimaryLink href={APP_HREF}>Open the app</PrimaryLink>
                <a
                  href="#partners"
                  className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-6 text-[15px] font-medium transition-colors hover:bg-white/10"
                >
                  For partners
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Problem() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid gap-5 lg:grid-cols-[1fr_2.4fr]">
        <p className="text-[15px] text-muted">The problem</p>
        <div>
          <h2 className="text-balance text-[32px] leading-[1.1] font-medium tracking-[-0.035em] sm:text-[46px]">
            Too few extension officers. Too many diseases that look alike. So farmers guess, and lose the harvest.
          </h2>
        </div>
      </div>
      <p className="mt-16 text-[15px] text-muted sm:mt-24">What we are building to</p>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ink/15 pt-8 lg:grid-cols-4">
        {TARGETS.map((target) => (
          <div key={target.value}>
            <dt className="text-[32px] leading-none font-medium tracking-[-0.04em] sm:text-[42px]">{target.value}</dt>
            <dd className="mt-3 max-w-[220px] text-[15px] leading-snug text-muted">{target.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function StepCard({ step, title, body, children }: { step: string; title: string; body: string; children: ReactNode }) {
  return (
    <li className="flex flex-col rounded-3xl bg-sage p-3">
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="text-[22px] font-medium tracking-[-0.03em]">Step {step}</span>
      </div>
      <div className="flex h-52 items-center justify-center px-3">{children}</div>
      <div className="rounded-2xl bg-bone p-5">
        <h3 className="text-[19px] leading-tight font-medium tracking-[-0.02em]">{title}</h3>
        <p className="mt-2 text-[15px] leading-snug text-muted">{body}</p>
      </div>
    </li>
  );
}

function Chip({ active = false, children }: { active?: boolean; children: ReactNode }) {
  return (
    <span className={`rounded-xl px-4 py-2.5 text-sm font-medium ${active ? "bg-ink text-lime" : "bg-bone text-ink"}`}>{children}</span>
  );
}

const WAVE = [10, 22, 34, 18, 42, 28, 50, 24, 38, 16, 30, 44, 20, 34, 12];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white/60 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <SectionHeading label="How it works" center>
          Big icons, little reading, a first opinion in about 30 seconds
        </SectionHeading>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          <StepCard step="01" title="Choose your language and crop" body="Tap a picture to start. The app remembers your language for next time.">
            <div className="flex max-w-[260px] flex-wrap justify-center gap-2">
              <Chip active>Twi</Chip>
              <Chip>English</Chip>
              <span className="basis-full" />
              <Chip active>Maize</Chip>
              <Chip>Cassava</Chip>
              <Chip>Cocoa</Chip>
            </div>
          </StepCard>
          <StepCard step="02" title="Photograph the leaf" body="On-screen tips guide you. If the photo is dark or blurry, the app asks for another.">
            <div className="relative h-40 w-56 overflow-hidden rounded-2xl">
              <Image src="/images/field-rows.jpg" alt="" fill sizes="520px" className="origin-[48%_82%] scale-[2.3] object-cover object-[48%_100%]" />
              <div className="absolute inset-5 rounded-lg border-2 border-dashed border-white/90" />
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-xs whitespace-nowrap text-white">Good light</span>
            </div>
          </StepCard>
          <StepCard step="03" title="Read or hear the answer" body="Likely causes, what to do this week, and any warnings, read aloud in your language.">
            <div className="flex items-center gap-4 rounded-full bg-bone py-2.5 pr-6 pl-2.5">
              <span className="grid size-12 place-items-center rounded-full bg-ink text-lime">
                <svg viewBox="0 0 16 16" aria-hidden className="ml-0.5 size-4 fill-current">
                  <path d="M3.5 1.8v12.4a.6.6 0 0 0 .92.5l9.6-6.2a.6.6 0 0 0 0-1l-9.6-6.2a.6.6 0 0 0-.92.5Z" />
                </svg>
              </span>
              <span className="flex h-12 items-center gap-[3px]" aria-hidden>
                {WAVE.map((h, i) => (
                  <span key={i} className="w-[3px] rounded-full bg-ink/70" style={{ height: h * 0.8 }} />
                ))}
              </span>
            </div>
          </StepCard>
        </ol>
      </div>
    </section>
  );
}

function Phone() {
  return (
    <div className="w-[290px] rounded-[40px] bg-ink p-2.5 shadow-2xl shadow-ink/30">
      <div className="overflow-hidden rounded-[31px] bg-bone">
        <div className="relative h-36 overflow-hidden">
          <Image src="/images/field-rows.jpg" alt="" fill sizes="600px" className="origin-[82%_62%] scale-[2.1] object-cover object-[82%_100%]" />
        </div>
        <div className="p-4">
          <p className="text-xs text-muted">Most likely</p>
          <p className="mt-0.5 text-xl leading-tight font-medium tracking-tight">Maize streak virus</p>
          <p className="mt-2 inline-flex rounded-full bg-lime px-2.5 py-1 text-xs font-medium">Medium confidence</p>
          <p className="mt-3 border-t border-ink/10 pt-3 text-[13px] text-muted">Could also be nutrient deficiency</p>
          <p className="mt-3 text-[13px] font-medium">What to do today</p>
          <ul className="mt-1.5 space-y-1.5 text-[13px] leading-snug text-muted">
            <li className="flex gap-2"><span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss" />Pull out badly affected plants</li>
            <li className="flex gap-2"><span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss" />Clear grassy weeds nearby</li>
            <li className="flex gap-2"><span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-moss" />Ask your officer before spraying</li>
          </ul>
          <p className="mt-4 flex h-11 items-center justify-center rounded-full bg-ink text-sm font-medium text-white">Listen</p>
          <p className="mt-3 text-center text-xs text-muted">Was this right?</p>
        </div>
      </div>
    </div>
  );
}

function Product() {
  return (
    <section className="mx-auto grid w-full max-w-[1240px] items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-20">
      <div>
        <SectionHeading label="What you get">An answer you can act on today</SectionHeading>
        <ul className="mt-10 border-t border-ink/15">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="border-b border-ink/15 py-5">
              <h3 className="text-[19px] font-medium tracking-[-0.02em]">{feature.title}</h3>
              <p className="mt-1.5 max-w-lg text-[15px] leading-snug text-muted">{feature.body}</p>
            </li>
          ))}
        </ul>
      </div>
      <figure className="flex justify-center rounded-3xl bg-sage px-4 py-12 sm:py-16">
        <Phone />
        <figcaption className="sr-only">Example of the result screen, with a likely diagnosis, an alternative, and steps for today.</figcaption>
      </figure>
    </section>
  );
}

function Trust() {
  return (
    <section id="why-trust-it" className="bg-sage py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
        <SectionHeading label="Why trust it">The AI reads the photo. Vetted sources write the advice.</SectionHeading>
        <div className="mt-12 grid items-end gap-4 lg:grid-cols-3">
          {TRUST.map((card) => (
            <article key={card.title} className={`relative isolate flex h-[440px] flex-col justify-between overflow-hidden rounded-3xl p-6 text-white ${card.height}`}>
              <Image src={card.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className={`-z-20 object-cover ${card.position}`} />
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/90 via-ink/45 to-ink/40" />
              <div>
                <h3 className="text-[26px] leading-[1.1] font-medium tracking-[-0.03em]">{card.title}</h3>
                <p className="mt-3 text-[15px] leading-snug text-white/95">{card.body}</p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <li key={tag} className="rounded-full bg-bone px-3.5 py-1.5 text-[13px] text-ink">{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section id="partners" className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
      <div>
        <SectionHeading label="For partners">Run a one-season pilot with your farmers</SectionHeading>
        <p className="mt-5 max-w-md text-[17px] leading-snug text-muted">
          For cooperatives, NGOs, extension services and funders who want a faster first response for the farmers they serve.
        </p>
        <a
          href={`mailto:${PARTNER_EMAIL}`}
          className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-white transition-colors hover:bg-moss"
        >
          Talk to us about a pilot
          <Arrow />
        </a>
      </div>
      <div className="space-y-2">
        {FAQS.map((faq, index) => (
          <details key={faq.q} name="partner-faq" open={index === 0} className="group rounded-2xl border border-ink/12 bg-white/50 open:bg-sage">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[17px] font-medium tracking-[-0.01em] [&::-webkit-details-marker]:hidden">
              {faq.q}
              <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4 shrink-0 transition-transform group-open:rotate-180">
                <path d="m3 6 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <p className="px-5 pb-5 text-[15px] leading-relaxed text-ink/80">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function GetTheApp() {
  return (
    <section id="get-the-app" className="bg-ink px-3 pt-20 pb-3 sm:pt-28">
      <div className="mx-auto w-full max-w-[1216px] sm:px-5">
        <SectionHeading label="Get the app" center invert>
          No app store. Add it to your phone from here.
        </SectionHeading>
        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {INSTALL.map((item) => (
            <div key={item.device} className="rounded-3xl bg-moss p-6 text-white">
              <h3 className="text-[22px] font-medium tracking-[-0.03em]">{item.device}</h3>
              <ol className="mt-5 space-y-3">
                {item.steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3 text-[15px] leading-snug">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-lime text-xs font-medium text-ink">{index + 1}</span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 border-t border-white/15 pt-4 text-sm text-white/75">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="mx-auto mt-20 w-full max-w-[1216px] rounded-3xl bg-white p-7 text-ink sm:mt-28 sm:p-9">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-[15px] leading-snug text-muted">
              A first opinion, not a laboratory diagnosis. If you are unsure, talk to your extension officer.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-col gap-3 text-[15px] sm:flex-row sm:gap-8">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="py-1 transition-opacity hover:opacity-60">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-ink/10 pt-5 text-sm text-muted">© 2026 Crop Doctor</p>
      </footer>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <HowItWorks />
      <Product />
      <Trust />
      <Partners />
      <GetTheApp />
    </main>
  );
}
