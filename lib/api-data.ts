import { loadSharedTaskTopics } from "@/lib/data";
import { systemById, systems } from "@/lib/systems";
import type { SharedTaskTopic, SystemId } from "@/lib/types";

export const legacySystemNames = Object.fromEntries(
  systems.map((system) => [`System ${system.id}`, system.id]),
) as Record<string, SystemId>;

export function selectedSystemIds(value: string | null): SystemId[] {
  if (!value?.trim()) return systems.map((system) => system.id);

  const selected = value
    .split(",")
    .map((name) => name.trim())
    .map((name) => legacySystemNames[name])
    .filter((id): id is SystemId => Boolean(id));

  return selected.length ? [...new Set(selected)] : systems.map((system) => system.id);
}

export function searchTopics(query: string): SharedTaskTopic[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];

  return loadSharedTaskTopics().filter((topic) => {
    const searchable = [
      topic.id,
      topic.question,
      topic.topic,
      topic.narrative,
    ]
      .join(" ")
      .toLowerCase();

    return tokens.every((token) => searchable.includes(token));
  });
}

export function legacySystemDescriptions(): Record<string, string> {
  return Object.fromEntries(
    systems.map((system) => [
      `System ${system.id}`,
      [
        system.name,
        system.summary,
        `Pipeline: ${system.stages.join(" -> ")}`,
      ].join("\n"),
    ]),
  );
}

export function serializeSearchResult(
  topic: SharedTaskTopic,
  systemIds: SystemId[],
) {
  const answers: Record<
    string,
    {
      text: string;
      sentences: Array<{ text: string; pmids: string[] }>;
      pmids_all: string[];
    }
  > = {};
  const pmids: Record<string, string[]> = {};

  for (const systemId of systemIds) {
    const systemName = `System ${systemId}`;
    const answer = topic.answers[systemId];
    const sentences = answer.sentences.map((sentence) => ({
      text: sentence.text,
      pmids: sentence.citations,
    }));
    const allPmids = [...new Set(sentences.flatMap((sentence) => sentence.pmids))];

    answers[systemName] = {
      text: sentences.map((sentence) => sentence.text).join(" "),
      sentences,
      pmids_all: allPmids,
    };
    pmids[systemName] = allPmids;
  }

  return {
    id: Number(topic.id),
    question: topic.question,
    topic: topic.topic,
    narrative: topic.narrative,
    answers,
    pmids,
  };
}

export function publicSystemSummary() {
  return systems.map((system) => ({
    id: system.id,
    name: `System ${system.id}`,
    label: system.name,
    family: system.family,
    budget: system.budget,
    summary: system.summary,
    stages: system.stages,
    runName: systemById[system.id].name,
  }));
}
