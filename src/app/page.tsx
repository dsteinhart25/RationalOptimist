export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <span className="text-sm font-bold tracking-tight">
          <span className="text-white">Rational Optimist</span>{" "}
          <span className="text-gold">Society</span>
        </span>
        <div className="flex items-center gap-6 text-xs font-medium text-slate">
          <a
            href="https://rationaloptimistsociety.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block hover:text-white transition-colors"
          >
            Newsletter
          </a>
          <a
            href="#join"
            className="px-4 py-1.5 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
          >
            Join Free
          </a>
        </div>
      </nav>

      {/* Hero — logo + join CTA */}
      <section className="stars flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Rational Optimist Society"
            className="w-56 sm:w-72 h-auto mx-auto"
          />

          <p className="mt-8 text-base sm:text-lg text-slate leading-relaxed">
            A free community of thinkers championing human prosperity. Join and
            get our newsletter.
          </p>

          <a
            href="https://rationaloptimistsociety.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block w-full sm:w-auto px-10 py-4 bg-gold text-navy font-bold rounded-lg text-lg hover:bg-gold-light transition-colors"
          >
            Join for Free
          </a>

          <p className="mt-3 text-xs text-gray-500">
            Free forever. No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Links — Merch, Books, Patron's Area */}
      <section className="border-t border-gray-800 bg-navy-light py-12">
        <div className="max-w-lg mx-auto px-6 grid grid-cols-3 gap-4">
          <a
            href="#"
            className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
          >
            <span className="text-2xl">&#128085;</span>
            <span className="text-xs font-semibold group-hover:text-gold transition-colors">
              ROS Merch
            </span>
          </a>
          <a
            href="#"
            className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
          >
            <span className="text-2xl">&#128218;</span>
            <span className="text-xs font-semibold group-hover:text-gold transition-colors">
              ROS Books
            </span>
          </a>
          <a
            href="#"
            className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
          >
            <span className="text-2xl">&#128274;</span>
            <span className="text-xs font-semibold group-hover:text-gold transition-colors">
              Patron&apos;s Area
            </span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Rational Optimist Society
          </p>
          <div className="flex gap-5 text-xs text-gray-600">
            <a
              href="https://rationaloptimistsociety.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              Substack
            </a>
            <a
              href="https://x.com/RationalOptSoc"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              X
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
