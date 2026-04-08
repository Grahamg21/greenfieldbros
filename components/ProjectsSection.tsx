"use client";

// Placeholder project data — update with real GitHub usernames in .env.local
// Once NEXT_PUBLIC_GITHUB_USER_GRAHAM is set, these will be pulled live via /api/github
const projects = [
  {
    name: "greenfieldbros.com",
    description: "This site — Next.js, Tailwind, deployed on Vercel.",
    lang: "TypeScript",
    langColor: "#3178c6",
    stars: 0,
    topics: ["nextjs", "tailwind", "gaming"],
    url: "#",
  },
  {
    name: "ai-controller",
    description: "Phaser 3 + React + FastAPI dashboard. AI agents visualized as Pokémon-style creatures on a tiled world map.",
    lang: "Python",
    langColor: "#3572a5",
    stars: 0,
    topics: ["ai", "phaser3", "fastapi", "react"],
    url: "#",
  },
  {
    name: "greenfield-gardens-ai",
    description: "Personal AI assistant with scheduling, task management, and daily logging.",
    lang: "Python",
    langColor: "#3572a5",
    stars: 0,
    topics: ["ai", "automation", "claude"],
    url: "#",
  },
];

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

        {/* GitHub connect banner */}
        <div className="card p-5 mb-8 flex items-start gap-4 border-purple/20">
          <div className="text-3xl">🐙</div>
          <div>
            <p className="text-text font-semibold">Connect GitHub Accounts</p>
            <p className="text-muted text-sm mt-1">
              Set{" "}
              <code className="text-purple font-mono text-xs bg-surface-2 px-1.5 py-0.5 rounded">
                NEXT_PUBLIC_GITHUB_USER_GRAHAM
              </code>{" "}
              and{" "}
              <code className="text-purple font-mono text-xs bg-surface-2 px-1.5 py-0.5 rounded">
                NEXT_PUBLIC_GITHUB_USER_BROTHER
              </code>{" "}
              in{" "}
              <code className="text-neon font-mono text-xs bg-surface-2 px-1.5 py-0.5 rounded">
                .env.local
              </code>{" "}
              to pull live repos, contribution graphs, and pinned projects.
            </p>
          </div>
        </div>

        {/* Project cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {projects.map((p) => (
            <ProjectCard key={p.name} project={p} />
          ))}
        </div>

        {/* Tech stack */}
        <div>
          <h3 className="text-sm font-mono text-muted tracking-widest uppercase mb-4">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-3">
            {techStack.map((t) => (
              <div
                key={t.label}
                className="card flex items-center gap-2 px-4 py-2 text-sm"
              >
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

function ProjectCard({ project }: { project: (typeof projects)[0] }) {
  return (
    <a
      href={project.url}
      className="card p-5 flex flex-col gap-3 hover:border-purple/40 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-purple group-hover:text-text transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
          </svg>
          <span className="font-mono text-sm font-medium">{project.name}</span>
        </div>
        {project.stars > 0 && (
          <span className="text-muted text-xs flex items-center gap-1">
            ⭐ {project.stars}
          </span>
        )}
      </div>
      <p className="text-muted text-sm leading-relaxed flex-1">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.topics.map((t) => (
          <span
            key={t}
            className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-2 text-muted border border-border"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-auto">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: project.langColor }}
        />
        <span className="text-muted text-xs">{project.lang}</span>
      </div>
    </a>
  );
}
