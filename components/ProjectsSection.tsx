"use client";
import { useEffect, useState } from "react";

type Repo = {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  topics: string[];
};

type UserRepos = {
  key: string;
  username: string;
  repos: Repo[];
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

const techStack = [
  { label: "Python", icon: "🐍" },
  { label: "TypeScript", icon: "📘" },
  { label: "React / Next.js", icon: "⚛️" },
  { label: "FastAPI", icon: "🚀" },
  { label: "Claude API", icon: "🤖" },
  { label: "Tailwind CSS", icon: "🎨" },
  { label: "Vercel", icon: "▲" },
  { label: "Supabase", icon: "🗄️" },
];

export default function ProjectsSection() {
  const [data, setData] = useState<UserRepos[] | null>(null);
  const [activeUser, setActiveUser] = useState<string>("graham");

  useEffect(() => {
    fetch("/api/github")
      .then((r) => r.json())
      .then((d) => {
        if (d.users) setData(d.users);
      })
      .catch(() => setData([]));
  }, []);

  const current = data?.find((u) => u.key === activeUser);

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-12">
          <span className="section-label">{'// 01'}</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 text-text">
            Projects
          </h2>
          <p className="text-muted mt-3 max-w-xl">
            We build things. AI tools, dashboards, automation — whatever solves the problem.
          </p>
        </div>

        {/* User tabs — only show if multiple users */}
        {data && data.length > 1 && (
          <div className="flex gap-2 mb-6">
            {data.map((u) => (
              <button
                key={u.key}
                onClick={() => setActiveUser(u.key)}
                className={`font-mono text-xs px-4 py-2 rounded border transition-colors ${
                  activeUser === u.key
                    ? "border-neon/60 text-neon bg-neon/5"
                    : "border-border text-muted hover:text-text"
                }`}
              >
                {u.username}
              </button>
            ))}
          </div>
        )}

        {/* Loading skeleton */}
        {!data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-36 animate-pulse bg-surface-2" />
            ))}
          </div>
        )}

        {/* Repo cards */}
        {current && (
          <>
            {current.repos.length === 0 ? (
              <div className="card p-6 text-muted text-sm text-center mb-12">
                No public repos found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                {current.repos.map((repo) => (
                  <RepoCard key={repo.name} repo={repo} />
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <a
                href={`https://github.com/${current.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono px-4 py-2 border border-neon/30 text-neon rounded hover:bg-neon/10 transition-colors"
              >
                VIEW ALL ON GITHUB →
              </a>
            </div>
          </>
        )}

        {/* Tech stack */}
        <div className="mt-8">
          <h3 className="text-sm font-mono text-muted tracking-widest uppercase mb-4">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-3">
            {techStack.map((t) => (
              <div key={t.label} className="card flex items-center gap-2 px-4 py-2 text-sm">
                <span>{t.icon}</span>
                <span className="text-text">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-5 flex flex-col gap-3 hover:border-purple/40 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-purple group-hover:text-text transition-colors">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
          </svg>
          <span className="font-mono text-sm font-medium truncate">{repo.name}</span>
        </div>
        {repo.stars > 0 && (
          <span className="text-muted text-xs flex items-center gap-1 shrink-0">⭐ {repo.stars}</span>
        )}
      </div>

      <p className="text-muted text-sm leading-relaxed flex-1">
        {repo.description ?? "No description yet."}
      </p>

      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 4).map((t) => (
            <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border">
              {t}
            </span>
          ))}
        </div>
      )}

      {repo.language && (
        <div className="flex items-center gap-1.5 mt-auto">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: LANG_COLORS[repo.language] ?? "#6b7280" }}
          />
          <span className="text-muted text-xs">{repo.language}</span>
        </div>
      )}
    </a>
  );
}
