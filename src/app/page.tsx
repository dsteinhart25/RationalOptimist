export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight text-gold">
          Rational Optimist Society
        </span>
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-300">
          <a href="#mission" className="hover:text-gold transition-colors">
            Mission
          </a>
          <a href="#join" className="hover:text-gold transition-colors">
            Join
          </a>
          <a
            href="https://rationaloptimistsociety.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors"
          >
            Newsletter
          </a>
          <a
            href="#resources"
            className="hover:text-gold transition-colors"
          >
            Resources
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="uppercase tracking-[0.25em] text-gold text-sm font-medium mb-6">
          Sapere Aude &mdash; Dare to Know
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-white">
          The world is getting better.
          <br />
          <span className="text-gold">Join the people who know why.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          The Rational Optimist Society is a free community of thinkers who
          champion human prosperity through innovation, freedom, and
          technological progress. Join us and get our newsletter delivered to
          your inbox.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#join"
            className="px-8 py-3.5 bg-gold text-navy font-semibold rounded-lg hover:bg-gold-light transition-colors text-center"
          >
            Join for Free
          </a>
          <a
            href="#mission"
            className="px-8 py-3.5 border border-gray-600 text-gray-300 rounded-lg font-medium hover:border-gold hover:text-gold transition-colors text-center"
          >
            Our Mission
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-800 py-10 mt-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: "< 8%", label: "Extreme poverty, down from 50%" },
            { stat: "2/3", label: "Drop in child mortality" },
            { stat: "73 yrs", label: "Life expectancy, up from 30" },
            { stat: "90%", label: "Global literacy rate" },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-2xl sm:text-3xl font-bold text-gold">
                {item.stat}
              </div>
              <p className="mt-1 text-xs sm:text-sm text-gray-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Our Mission</h2>
        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">
          We champion the truth &mdash; informed by data, science, and logic
          &mdash; about how humanity ascended to where we are today, and the
          incredibly bright future now unfolding.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-gray-800 bg-navy-light">
            <div className="w-10 h-10 bg-gold/10 text-gold rounded-lg flex items-center justify-center text-lg font-bold mb-4">
              &#9733;
            </div>
            <h3 className="text-lg font-semibold mb-2">Freedom</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Of action, thought, speech, and private property. We support real
              capitalism &mdash; not buddies-with-the-government corporatism.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-gray-800 bg-navy-light">
            <div className="w-10 h-10 bg-gold/10 text-gold rounded-lg flex items-center justify-center text-lg font-bold mb-4">
              &#9889;
            </div>
            <h3 className="text-lg font-semibold mb-2">Innovation</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We respect problem-solving entrepreneurs who turn ideas into
              reality and scale them to be affordable for everyone.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-gray-800 bg-navy-light">
            <div className="w-10 h-10 bg-gold/10 text-gold rounded-lg flex items-center justify-center text-lg font-bold mb-4">
              &#9881;
            </div>
            <h3 className="text-lg font-semibold mb-2">Reason</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Rational Optimists think for themselves. We respect facts, data,
              and reason &mdash; and we educate to challenge conventional but
              false wisdom.
            </p>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-navy-light py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">What You Get as a Member</h2>
          <p className="text-gray-400 mb-12">
            Membership is free. Always has been, always will be.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-xl border border-gray-700">
              <h3 className="font-semibold text-gold mb-2">
                The ROS Newsletter
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Data-driven optimism delivered to your inbox. Featuring columns
                from Matt Ridley, good news you won&apos;t find in the media,
                and deep dives into innovation and progress.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-700">
              <h3 className="font-semibold text-gold mb-2">
                Good News Gallery
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                A curated feed of positive developments &mdash; from declining
                air pollution to food abundance to breakthroughs in energy and
                medicine.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-700">
              <h3 className="font-semibold text-gold mb-2">
                Community of Thinkers
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Join 21,000+ rational optimists who believe in human ingenuity
                and refuse to let negativity and cynicism impede progress.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-700">
              <h3 className="font-semibold text-gold mb-2">
                Resources &amp; Archives
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Access our full archive of essays, data visualizations, and the
                evidence that shows the world is wealthier, healthier, happier,
                and more peaceful than ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA Section */}
      <section id="join" className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Join the Rational Optimist Society
        </h2>
        <p className="text-gray-400 mb-8">
          It&apos;s free. Subscribe to our Substack and become part of a growing
          community that sees the world clearly.
        </p>
        <a
          href="https://rationaloptimistsociety.substack.com/subscribe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-10 py-4 bg-gold text-navy font-bold rounded-lg text-lg hover:bg-gold-light transition-colors"
        >
          Join for Free
        </a>
        <p className="mt-4 text-sm text-gray-500">
          21,000+ members and growing. No spam, unsubscribe anytime.
        </p>
      </section>

      {/* Resources Section */}
      <section
        id="resources"
        className="border-t border-gray-800 py-20 bg-navy-light"
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Resources</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <a
              href="#"
              className="group p-6 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
            >
              <div className="text-3xl mb-3">&#128722;</div>
              <h3 className="font-semibold group-hover:text-gold transition-colors">
                ROS Merch
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Wear your optimism. Shirts, hats, and more.
              </p>
            </a>
            <a
              href="#"
              className="group p-6 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
            >
              <div className="text-3xl mb-3">&#128218;</div>
              <h3 className="font-semibold group-hover:text-gold transition-colors">
                ROS Books
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Essential reading for rational optimists.
              </p>
            </a>
            <a
              href="#"
              className="group p-6 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
            >
              <div className="text-3xl mb-3">&#128274;</div>
              <h3 className="font-semibold group-hover:text-gold transition-colors">
                Patron&apos;s Area
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Exclusive content for patrons. Coming soon.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Rational Optimist Society
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
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
              X / Twitter
            </a>
            <a
              href="https://www.rationaloptimistsociety.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              Current Site
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
