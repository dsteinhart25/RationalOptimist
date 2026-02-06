export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">
          Rational Optimist
        </span>
        <div className="flex gap-6 text-sm font-medium text-gray-600">
          <a href="#ideas" className="hover:text-gray-900 transition-colors">
            Ideas
          </a>
          <a
            href="#progress"
            className="hover:text-gray-900 transition-colors"
          >
            Progress
          </a>
          <a href="#about" className="hover:text-gray-900 transition-colors">
            About
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
          The future is brighter
          <br />
          than you think
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Progress is real, measurable, and accelerating. We explore the ideas,
          innovations, and evidence that show why rational optimism is the most
          defensible worldview.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <a
            href="#ideas"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Explore Ideas
          </a>
          <a
            href="#about"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:border-gray-400 transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Ideas Section */}
      <section id="ideas" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Optimism Makes Sense
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-lg font-bold mb-4">
              &uarr;
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Living Standards Rise
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Extreme poverty has fallen from 36% to under 10% in just two
              decades. More people have access to clean water, electricity, and
              education than ever before.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-lg font-bold mb-4">
              &#x2699;
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Innovation Accelerates
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              From clean energy to medical breakthroughs, human ingenuity
              continues to solve problems once thought impossible. Each solution
              creates tools for the next.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-lg font-bold mb-4">
              &#x2727;
            </div>
            <h3 className="text-lg font-semibold mb-2">Knowledge Compounds</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Ideas build on ideas. Open access to information means more minds
              working on more problems, creating a virtuous cycle of discovery
              and progress.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section id="progress" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Progress by the Numbers
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: "90%", label: "Global literacy rate, up from 12% in 1820" },
              {
                stat: "73 yrs",
                label: "Average life expectancy, doubled since 1900",
              },
              {
                stat: "< 10%",
                label: "Extreme poverty rate, down from 36% in 1990",
              },
              {
                stat: "4.9B",
                label: "Internet users worldwide, connecting humanity",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white p-6 rounded-xl border border-gray-200 text-center"
              >
                <div className="text-3xl font-bold text-gray-900">
                  {item.stat}
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">About Rational Optimism</h2>
        <p className="text-gray-600 leading-relaxed">
          Rational optimism isn&apos;t naive positivity. It&apos;s a
          clear-eyed assessment of the evidence: that human cooperation, trade,
          and innovation have consistently improved life on Earth. Inspired by
          thinkers like Matt Ridley, Steven Pinker, and Hans Rosling, we believe
          in looking at the data&mdash;and the data tells a story of remarkable
          progress.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Rational Optimist</p>
      </footer>
    </div>
  );
}
