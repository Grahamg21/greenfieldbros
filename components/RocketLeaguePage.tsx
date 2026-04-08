import RocketLeagueSection from "./RocketLeagueSection";

export default function RocketLeaguePage() {
  return (
    <section id="rocketleague" className="py-24 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="section-label">{'// 03'}</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-text">
            Rocket League
          </h2>
          <p className="text-muted mt-3 max-w-xl">
            Ranks, career stats, and the eternal bro rivalry — all three of us.
          </p>
        </div>
        <RocketLeagueSection />
      </div>
    </section>
  );
}
