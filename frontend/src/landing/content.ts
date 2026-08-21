/**
 * Copy and data for the marketing page, kept out of the section components so
 * the layout files stay readable and the wording is editable in one place.
 */
import imgFabio from "../assets/images/team/fabio.webp";
import imgNeo from "../assets/images/team/neo.webp";
import imgOphelia from "../assets/images/team/ophelia.webp";
import imgShaun from "../assets/images/team/shaun.webp";
import imgVele from "../assets/images/team/vele.webp";

export const NAV_LINKS = [
  { name: "Product", link: "#showcase" },
  { name: "Workflow", link: "#workflow" },
  { name: "Pipeline", link: "#pipeline" },
  { name: "Team", link: "#team" },
] as const;

/** Swapped by <FlipWords> in the hero headline. */
export const HERO_FLIP_WORDS = [
  "a lesson",
  "a heatmap",
  "a correction",
  "a rank",
];

export const HERO_STATS = [
  { value: "12", label: "spatial metrics per match" },
  { value: "1s", label: "timeline resolution" },
  { value: "5", label: "roles modelled" },
  { value: "100%", label: "of deaths mapped" },
] as const;

/** The strip that scrolls under the hero. */
export const CAPABILITIES = [
  "Spatial Intelligence",
  "AI Coaching",
  "Positioning",
  "Risk Prediction",
  "Ghost Overlay",
  "Cluster Analysis",
] as const;

export const WORKFLOW_STEPS = [
  {
    title: "Link your Riot ID",
    description:
      "One sign-in pulls your match history straight from the Riot Match-V5 API. No overlays to install, no client mods, nothing to run while you play.",
  },
  {
    title: "We replay the coordinates",
    description:
      "Every timeline frame carries an (x, y) for all ten players. Vantage Point rebuilds the match second by second so a fight becomes a path, not a line in a scoreboard.",
  },
  {
    title: "The model finds the mistake",
    description:
      "K-Means clusters your deaths into recurring mistakes, and a Random Forest scores the risk of every tile you stood on. What looks like bad luck turns out to be the same corner, twelve games running.",
  },
  {
    title: "A ghost shows the fix",
    description:
      "K-Nearest Neighbours pulls the closest winning snapshot from professional play and drops a ghost player on your map, with a vector for the step you should have taken.",
  },
] as const;

export const PIPELINE_STAGES = [
  {
    stage: "Ingest",
    blurb:
      "Match-V5 timelines land in PostgreSQL through a rate-limited FastAPI collector, deduplicated by match ID.",
    points: [
      "Riot Match-V5 timeline + participant frames",
      "Rate-limited, retried, and cached",
      "Spatial benchmarks stored per patch",
    ],
  },
  {
    stage: "Model",
    blurb:
      "Pandas reshapes the frames, then scikit-learn turns raw position into a judgement about that position.",
    points: [
      "K-Means → recurring mistake clusters",
      "Random Forest → death probability per tile",
      "K-Nearest Neighbours → closest winning snapshot",
    ],
  },
  {
    stage: "Render",
    blurb:
      "D3.js draws coordinate-accurate overlays on the live map so the analysis sits exactly where it happened.",
    points: [
      "Interactive 2D map overlays",
      "Ghost player with movement vectors",
      "Scrubbable replay timeline",
    ],
  },
  {
    stage: "Coach",
    blurb:
      "The dashboard turns all of it into a short list of things to change before your next queue.",
    points: [
      "Ranked positioning errors",
      "Playstyle categorisation",
      "Progress tracked match over match",
    ],
  },
] as const;

export const TEAM = [
  {
    id: 1,
    name: "Fabio Berrino",
    designation: "Scrum Master · DevSecOps",
    image: imgFabio,
  },
  {
    id: 2,
    name: "Ophelia Greyling",
    designation: "Data Analyst · AI/ML",
    image: imgOphelia,
  },
  {
    id: 3,
    name: "Vele Ndamulelo",
    designation: "Design · Frontend",
    image: imgVele,
  },
  {
    id: 4,
    name: "Neo Machaba",
    designation: "Database Manager",
    image: imgNeo,
  },
  { id: 5, name: "Shaun Marx", designation: "API · Backend", image: imgShaun },
];
