import { NextResponse } from "next/server";

const USERS = [
  { key: "graham", username: "Grahamg21" },
  // Add Gabe's GitHub username here when known
  // { key: "brother", username: "gabesusername" },
];

// Fallback descriptions for repos that don't have one set on GitHub
const DESCRIPTIONS: Record<string, string> = {
  "greenfieldbros": "greenfieldbros.com — gaming, golf, and projects.",
  "ai-controller": "Phaser 3 + React + FastAPI dashboard. AI agents visualized as Pokémon-style creatures on a tiled world map.",
  "greenfield-gardens": "Personal AI assistant with scheduling, task management, and daily logging.",
  "greenfield-gardens-ai": "Personal AI assistant with scheduling, task management, and daily logging.",
  "wassup_world": "First project — the journey starts here.",
};

type GithubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  fork: boolean;
  archived: boolean;
  updated_at: string;
};

export async function GET() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const results = await Promise.all(
      USERS.map(async ({ key, username }) => {
        const res = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=12`,
          { headers, next: { revalidate: 3600 } }
        );
        if (!res.ok) return { key, username, repos: [] };

        const data: GithubRepo[] = await res.json();
        const repos = data
          .filter((r) => !r.fork && !r.archived)
          .slice(0, 6)
          .map((r) => ({
            name: r.name,
            description: r.description || DESCRIPTIONS[r.name] || null,
            url: r.html_url,
            language: r.language,
            stars: r.stargazers_count,
            topics: r.topics ?? [],
          }));

        return { key, username, repos };
      })
    );

    return NextResponse.json({ users: results });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
