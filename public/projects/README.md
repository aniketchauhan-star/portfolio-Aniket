# Project imagery

Put project images in this folder and reference them from
`src/data/profile.ts` with a path rooted at `/projects/`.

```
public/projects/
  project-01.webp
  project-02.webp
  project-03.webp
```

```ts
// src/data/profile.ts
{
  id: "project-01",
  image: "/projects/project-01.webp",
  gallery: ["/projects/project-01-detail.webp"],
}
```

## Conventions

| | |
| --- | --- |
| Format | `.webp`, `.avif` or `.jpg` — Next.js re-encodes and negotiates modern formats either way |
| Card ratio | roughly **16:9**; cards crop to 16:8.4 on large screens |
| Width | **2000px** is plenty. Do not ship 4K screenshots |
| Weight | aim for **under 300 KB** per image |
| Content | dark, low-contrast imagery sits best against the near-black page |

## Playable builds

A project with a `playUrl` uses its image as the **poster** behind the play
button, so a frame from the game itself works best.
`platform-adventure.jpg` was captured straight from the running build.

## No image yet?

Leave `image` as `""` (or omit it). The card renders a designed
`PROJECT VISUAL / COMING SOON` panel that matches the rest of the interface —
that is intentional, so never substitute a stock photograph.
