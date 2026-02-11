"use client";

import GoodNewsChart, { type ChartDatum } from "@/components/GoodNewsChart";

const BASE = "/RationalOptimist";
const LOGO = `${BASE}/logo.png`;

/* =====================================================================
   CHART DATA
   All figures are drawn from publicly available datasets (Our World in
   Data, World Bank, EPA, EM-DAT) and rounded for readability.
   ===================================================================== */

const extremePoverty: ChartDatum[] = [
  { label: "1820", value: 76 },
  { label: "1850", value: 73 },
  { label: "1870", value: 68 },
  { label: "1900", value: 63 },
  { label: "1929", value: 56 },
  { label: "1950", value: 55 },
  { label: "1960", value: 53 },
  { label: "1970", value: 47 },
  { label: "1980", value: 42 },
  { label: "1990", value: 36 },
  { label: "2000", value: 28 },
  { label: "2010", value: 16 },
  { label: "2015", value: 10 },
  { label: "2019", value: 8.4 },
  { label: "2024", value: 7.9 },
];

const childMortality: ChartDatum[] = [
  { label: "1960", value: 185 },
  { label: "1970", value: 146 },
  { label: "1980", value: 115 },
  { label: "1990", value: 93 },
  { label: "2000", value: 76 },
  { label: "2005", value: 63 },
  { label: "2010", value: 52 },
  { label: "2015", value: 43 },
  { label: "2020", value: 37 },
  { label: "2023", value: 35 },
];

const lifeExpectancy: ChartDatum[] = [
  { label: "1950", value: 46.5 },
  { label: "1960", value: 50.4 },
  { label: "1970", value: 56.4 },
  { label: "1980", value: 61.2 },
  { label: "1990", value: 64.2 },
  { label: "2000", value: 66.8 },
  { label: "2005", value: 68.3 },
  { label: "2010", value: 70.0 },
  { label: "2015", value: 71.7 },
  { label: "2020", value: 72.6 },
  { label: "2024", value: 73.4 },
];

const usAirPollution: ChartDatum[] = [
  { label: "1970", value: 100 },
  { label: "1975", value: 89 },
  { label: "1980", value: 82 },
  { label: "1985", value: 74 },
  { label: "1990", value: 67 },
  { label: "1995", value: 59 },
  { label: "2000", value: 52 },
  { label: "2005", value: 45 },
  { label: "2010", value: 38 },
  { label: "2015", value: 30 },
  { label: "2020", value: 27 },
  { label: "2023", value: 22 },
];

const usCarbonEmissions: ChartDatum[] = [
  { label: "1990", value: 5.04 },
  { label: "1995", value: 5.29 },
  { label: "2000", value: 5.86 },
  { label: "2005", value: 5.99 },
  { label: "2007", value: 6.00 },
  { label: "2010", value: 5.58 },
  { label: "2012", value: 5.23 },
  { label: "2015", value: 5.26 },
  { label: "2018", value: 5.27 },
  { label: "2020", value: 4.57 },
  { label: "2023", value: 4.91 },
];

const famineDeaths: ChartDatum[] = [
  { label: "1860s", value: 9700 },
  { label: "1870s", value: 18700 },
  { label: "1880s", value: 600 },
  { label: "1890s", value: 1200 },
  { label: "1900s", value: 4400 },
  { label: "1910s", value: 4200 },
  { label: "1920s", value: 5400 },
  { label: "1930s", value: 11900 },
  { label: "1940s", value: 8800 },
  { label: "1950s", value: 22200 },
  { label: "1960s", value: 2600 },
  { label: "1970s", value: 2900 },
  { label: "1980s", value: 1200 },
  { label: "1990s", value: 600 },
  { label: "2000s", value: 400 },
  { label: "2010s", value: 350 },
];

/* =====================================================================
   PAGE COMPONENT
   ===================================================================== */

export default function GoodNewsGallery() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto w-full">
        <a href={BASE || "/"} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="" className="h-10 w-10" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Rational Optimist</span>{" "}
            <span className="text-gold">Society</span>
          </span>
        </a>
        <div className="flex items-center gap-6">
          <a
            href="https://rationaloptimistsociety.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-base text-slate-blue hover:text-white transition-colors"
          >
            Newsletter
          </a>
          <a
            href="https://rationaloptimistsociety.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-gold text-navy text-base font-bold rounded-lg hover:bg-gold-light transition-colors"
          >
            Join Free
          </a>
        </div>
      </nav>

      {/* Header */}
      <header className="px-8 pt-12 pb-8 max-w-5xl mx-auto w-full text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          <span className="text-white">Good News</span>{" "}
          <span className="text-gold">Gallery</span>
        </h1>
        <p className="mt-4 text-lg text-slate-blue max-w-2xl mx-auto leading-relaxed">
          Discover data that shows why you should be a Rational Optimist. Hover
          over any chart to explore the data points.
        </p>
      </header>

      {/* Charts grid */}
      <main className="flex-1 px-6 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1 — Extreme Poverty */}
          <GoodNewsChart
            title="Extreme Poverty Is Disappearing"
            subtitle="Share of world population living on less than $2.15 per day (adjusted for inflation). Down from 76% to under 8% — the greatest achievement in human history."
            data={extremePoverty}
            ySuffix="%"
            yLabel="% of world population"
            source="Our World in Data / World Bank (2024)"
          />

          {/* 2 — Child Mortality */}
          <GoodNewsChart
            title="Child Mortality Has Plummeted"
            subtitle="Under-5 deaths per 1,000 live births worldwide. In 1960, nearly 1 in 5 children died before age five. Today it's fewer than 1 in 25."
            data={childMortality}
            yLabel="Deaths per 1,000 live births"
            source="UN Inter-agency Group for Child Mortality Estimation (2024)"
          />

          {/* 3 — Life Expectancy */}
          <GoodNewsChart
            title="We're Living Longer Than Ever"
            subtitle="Global average life expectancy at birth. Up from 46 years in 1950 to over 73 today — a gain of nearly three decades."
            data={lifeExpectancy}
            ySuffix=" yrs"
            yLabel="Years"
            source="UN World Population Prospects (2024)"
            accentColor="#5bb98c"
          />

          {/* 4 — US Air Pollution */}
          <GoodNewsChart
            title="US Air Pollution Keeps Falling"
            subtitle="Aggregate emissions of the six EPA criteria pollutants (indexed: 1970 = 100). Despite GDP tripling, pollution has dropped by 78%."
            data={usAirPollution}
            yLabel="Pollution index (1970 = 100)"
            source="US EPA Air Quality Trends (2024)"
            accentColor="#5b9bd5"
          />

          {/* 5 — US Carbon Emissions */}
          <GoodNewsChart
            title="America's Carbon Is Declining"
            subtitle="Total US CO₂ emissions in billion metric tons. Down 18% from the 2007 peak — and this is total emissions, not per capita."
            data={usCarbonEmissions}
            ySuffix=" Gt"
            yLabel="Billion metric tons CO₂"
            source="US Energy Information Administration (2024)"
            accentColor="#5b9bd5"
            referenceValue={6.0}
            referenceLabel="2007 peak"
          />

          {/* 6 — Famine Deaths */}
          <GoodNewsChart
            title="Famines Are Going Extinct"
            subtitle="Deaths from famine per decade (thousands). Thanks to innovation and global trade, mass starvation has nearly vanished."
            data={famineDeaths}
            variant="bar"
            yLabel="Deaths (thousands)"
            yPrefix=""
            source="Our World in Data / EM-DAT (2024)"
            accentColor="#c9a84c"
          />
        </div>

        {/* Call to action */}
        <div className="mt-12 text-center rounded-2xl border border-gray-700/60 bg-navy-light p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-white">
            The world is getting better.{" "}
            <span className="text-gold">Spread the word.</span>
          </h2>
          <p className="mt-3 text-slate-blue max-w-xl mx-auto">
            Join thousands of Rational Optimists who refuse to let negativity
            bias distort reality. Get data-driven good news in your inbox.
          </p>
          <a
            href="https://rationaloptimistsociety.substack.com/subscribe"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block px-10 py-3.5 bg-gold text-navy font-bold rounded-lg text-lg hover:bg-gold-light transition-all shadow-[0_0_30px_rgba(201,168,76,0.2)] hover:shadow-[0_0_40px_rgba(201,168,76,0.35)]"
          >
            Join for Free
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          <p className="text-base text-gray-600">
            &copy; {new Date().getFullYear()} Rational Optimist Society
          </p>
          <div className="flex gap-6 text-base text-gray-600">
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
