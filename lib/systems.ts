import type { SystemId } from "@/lib/types";

export const systems: Array<{
  id: SystemId;
  name: string;
  family: string;
  budget: string;
  summary: string;
  stages: string[];
}> = [
  {
    id: "A",
    name: "Baseline",
    family: "Sparse",
    budget: "Original query",
    summary:
      "BM25 retrieves 25 passages for the original question, a cross-encoder reranks them, and the top five support Qwen generation.",
    stages: ["BM25", "Cross-encoder", "Qwen"],
  },
  {
    id: "B",
    name: "Sparse narrow",
    family: "Sparse + MMR",
    budget: "Narrow",
    summary:
      "Original and reformulated queries feed BM25 retrieval, summary-level TF-IDF scoring, and maximal marginal relevance selection.",
    stages: ["Reformulate", "BM25", "TF-IDF + MMR", "Qwen"],
  },
  {
    id: "C",
    name: "Dense narrow",
    family: "MedCPT",
    budget: "Narrow",
    summary:
      "BM25 candidates from four query variants are rescored with MedCPT bi- and cross-encoders before cited answer generation.",
    stages: ["Reformulate", "BM25", "MedCPT", "Qwen"],
  },
  {
    id: "D",
    name: "Dense wide",
    family: "MedCPT",
    budget: "Wide",
    summary:
      "A wider BM25 pool is pruned and reranked with MedCPT, preserving more evidence candidates before generation.",
    stages: ["Wide retrieval", "MedCPT", "Cross-encoder", "Qwen"],
  },
  {
    id: "E",
    name: "Sparse wide",
    family: "Sparse + MMR",
    budget: "Wide",
    summary:
      "Four wide retrieval branches yield up to 120 articles, followed by summary-level TF-IDF and diversity-aware evidence selection.",
    stages: ["Wide retrieval", "Summarize", "TF-IDF + MMR", "Qwen"],
  },
];

export const systemById = Object.fromEntries(
  systems.map((system) => [system.id, system]),
) as Record<SystemId, (typeof systems)[number]>;

export const officialLinks = {
  proceedings:
    "https://trec.nist.gov/pubs/trec34/papers/CLaC%20Lab.biogen.pdf",
  runs: "https://pages.nist.gov/trec-browser/trec34/biogen/runs/",
  track: "https://trec.nist.gov/pubs/trec34/index.html",
};
