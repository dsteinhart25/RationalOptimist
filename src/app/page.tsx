export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <a href="#" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Rational Optimist Society"
            className="h-10 w-10"
          />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Rational Optimist</span>{" "}
            <span className="text-gold">Society</span>
          </span>
        </a>
        <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate">
          <a href="#mission" className="hover:text-white transition-colors">
            Mission
          </a>
          <a href="#resources" className="hover:text-white transition-colors">
            Resources
          </a>
          <a
            href="#join"
            className="px-5 py-2 bg-gold text-navy font-semibold rounded-lg hover:bg-gold-light transition-colors"
          >
            Join Free
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="stars relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <p className="uppercase tracking-[0.2em] text-gold text-xs font-semibold mb-5">
              Sapere Aude &mdash; Dare to Know
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] text-white">
              The world is getting better.
              <span className="text-gold"> Join the people who know why.</span>
            </h1>
            <p className="mt-5 text-base text-slate max-w-lg leading-relaxed">
              The Rational Optimist Society is a free community of thinkers
              championing human prosperity through innovation, freedom, and
              progress. Join us and get our newsletter delivered straight to your
              inbox.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="https://rationaloptimistsociety.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-gold text-navy font-bold rounded-lg hover:bg-gold-light transition-colors text-center"
              >
                Join for Free
              </a>
              <a
                href="#mission"
                className="px-8 py-3.5 border border-gray-600 text-slate rounded-lg font-medium hover:border-gold hover:text-gold transition-colors text-center"
              >
                Our Mission
              </a>
            </div>
          </div>
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Rational Optimist Society — Ostrich Astronaut"
              className="w-64 sm:w-80 h-auto"
            />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-800 bg-navy-light/50 py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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
              <p className="mt-1 text-xs text-slate">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Our Mission</h2>
        <p className="text-center text-slate max-w-2xl mx-auto mb-14 text-sm leading-relaxed">
          We champion the truth &mdash; informed by data, science, and logic
          &mdash; about how humanity ascended to where we are today, and the
          incredibly bright future now unfolding.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "\u2605",
              title: "Freedom",
              text: "Of action, thought, speech, and private property. We support real capitalism \u2014 not buddies-with-the-government corporatism.",
            },
            {
              icon: "\u26A1",
              title: "Innovation",
              text: "We respect problem-solving entrepreneurs who turn ideas into reality and scale them to be affordable for everyone.",
            },
            {
              icon: "\u2316",
              title: "Reason",
              text: "Rational Optimists think for themselves. We respect facts, data, and reason \u2014 and we educate to challenge conventional but false wisdom.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="p-6 rounded-xl border border-gray-800 bg-navy-light"
            >
              <div className="w-10 h-10 bg-gold/10 text-gold rounded-lg flex items-center justify-center text-lg mb-4">
                {card.icon}
              </div>
              <h3 className="text-base font-semibold mb-2">{card.title}</h3>
              <p className="text-slate text-sm leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-navy-light py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">
            What You Get as a Member
          </h2>
          <p className="text-slate text-center mb-14 text-sm">
            Membership is free. Always has been, always will be.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "The ROS Newsletter",
                text: "Data-driven optimism delivered to your inbox. Featuring columns from Matt Ridley, good news you won\u2019t find in the media, and deep dives into innovation and progress.",
              },
              {
                title: "Good News Gallery",
                text: "A curated feed of positive developments \u2014 from declining air pollution to food abundance to breakthroughs in energy and medicine.",
              },
              {
                title: "Community of Thinkers",
                text: "Join 21,000+ rational optimists who believe in human ingenuity and refuse to let negativity and cynicism impede progress.",
              },
              {
                title: "Resources & Archives",
                text: "Access our full archive of essays, data visualizations, and the evidence that the world is wealthier, healthier, happier, and more peaceful than ever.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-gray-700"
              >
                <h3 className="font-semibold text-gold mb-2 text-sm">
                  {item.title}
                </h3>
                <p className="text-sm text-slate leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA Section */}
      <section id="join" className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            className="w-20 h-20 mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold mb-3">
            Join the Rational Optimist Society
          </h2>
          <p className="text-slate mb-8 text-sm leading-relaxed">
            It&apos;s free. Subscribe to our Substack and become part of a
            growing community that sees the world clearly.
          </p>
          <a
            href="https://rationaloptimistsociety.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 bg-gold text-navy font-bold rounded-lg text-lg hover:bg-gold-light transition-colors"
          >
            Join for Free
          </a>
          <p className="mt-4 text-xs text-gray-500">
            21,000+ members and growing. No spam, unsubscribe anytime.
          </p>
        </div>
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
              className="group p-8 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
            >
              <div className="text-4xl mb-4">&#128085;</div>
              <h3 className="font-semibold group-hover:text-gold transition-colors">
                ROS Merch
              </h3>
              <p className="text-xs text-slate mt-2">
                Wear your optimism. Shirts, hats, and more.
              </p>
            </a>
            <a
              href="#"
              className="group p-8 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
            >
              <div className="text-4xl mb-4">&#128218;</div>
              <h3 className="font-semibold group-hover:text-gold transition-colors">
                ROS Books
              </h3>
              <p className="text-xs text-slate mt-2">
                Essential reading for rational optimists.
              </p>
            </a>
            <a
              href="#"
              className="group p-8 rounded-xl border border-gray-700 hover:border-gold transition-colors text-center"
            >
              <div className="text-4xl mb-4">&#128274;</div>
              <h3 className="font-semibold group-hover:text-gold transition-colors">
                Patron&apos;s Area
              </h3>
              <p className="text-xs text-slate mt-2">
                Exclusive content for patrons.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              className="h-6 w-6"
            />
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Rational Optimist Society
            </p>
          </div>
          <div className="flex gap-6 text-xs text-gray-500">
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
          </div>
        </div>
      </footer>
    </div>
  );
}
