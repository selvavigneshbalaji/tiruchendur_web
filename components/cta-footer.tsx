import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaFooter() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-2xl text-balance font-serif text-3xl font-semibold text-primary-foreground sm:text-4xl">
            Your darshan deserves a perfect stay
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-primary-foreground/85">
            Book in under two minutes with instant confirmation and the best
            price in Tiruchendur, guaranteed.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="w-full px-8 sm:w-auto"
              nativeButton={false}
              render={<a href="#stays" />}
            >
              Browse all stays
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-primary-foreground/40 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
              nativeButton={false}
              render={
                <a
                  href="https://wa.me/9688104147"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Talk to host
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Sparkles className="size-5" />
                </span>
                <span className="font-serif text-lg font-semibold">
                  Tiruchendur Stays
                </span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                The trusted way to book hotels and homes near the Tiruchendur
                Murugan Temple.
              </p>
            </div>

            <FooterCol
              title="Stays"
              links={["Near the temple", "Sea-view hotels", "Heritage homes", "Budget rooms"]}
            />
            <FooterCol
              title="Support"
              links={["Help centre", "Cancellation policy", "Contact us", "Trust & safety"]}
            />
            <FooterCol
              title="Company"
              links={["About", "Careers", "Partner with us", "Privacy"]}
            />
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Tiruchendur Stays. All rights reserved.</p>
            <p>Made for pilgrims, with care.</p>
          </div>
        </div>
      </footer>
    </>
  )
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
