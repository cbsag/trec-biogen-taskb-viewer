import fs from "node:fs";
import path from "node:path";

import type {
  EvidenceSentence,
  SharedTaskTopic,
  SystemAnswer,
  SystemId,
} from "@/lib/types";

type RawTopic = {
  id: number;
  question: string;
  topic: string;
  narrative: string;
};

type RawOutput = {
  metadata: {
    run_id: string;
    topic_id: string;
  };
  responses: Array<{
    text: string;
    citations?: string[];
  }>;
};

const systemFiles: Record<SystemId, string> = {
  A: "system-a.jsonl",
  B: "system-b.jsonl",
  C: "system-c.jsonl",
  D: "system-d.jsonl",
  E: "system-e.jsonl",
};

let cachedTopics: SharedTaskTopic[] | null = null;

function readJsonLines(filePath: string): RawOutput[] {
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as RawOutput);
}

export function loadSharedTaskTopics(): SharedTaskTopic[] {
  if (cachedTopics) return cachedTopics;

  const dataDirectory = path.join(process.cwd(), "data", "shared-task");
  const topics = JSON.parse(
    fs.readFileSync(path.join(dataDirectory, "topics.json"), "utf8"),
  ) as RawTopic[];

  const answersBySystem = Object.fromEntries(
    (Object.entries(systemFiles) as Array<[SystemId, string]>).map(
      ([systemId, filename]) => {
        const answers = new Map<string, SystemAnswer>();
        for (const output of readJsonLines(path.join(dataDirectory, filename))) {
          const sentences: EvidenceSentence[] = output.responses.map((response) => ({
            text: response.text.trim(),
            citations: (response.citations ?? []).map(String),
          }));
          answers.set(String(output.metadata.topic_id), {
            runId: output.metadata.run_id,
            sentences,
          });
        }
        return [systemId, answers];
      },
    ),
  ) as Record<SystemId, Map<string, SystemAnswer>>;

  cachedTopics = topics.map((topic) => {
    const topicId = String(topic.id);
    return {
      id: topicId,
      question: topic.question,
      topic: topic.topic,
      narrative: topic.narrative,
      answers: Object.fromEntries(
        (Object.keys(systemFiles) as SystemId[]).map((systemId) => [
          systemId,
          answersBySystem[systemId].get(topicId) ?? {
            runId: `system_${systemId.toLowerCase()}`,
            sentences: [],
          },
        ]),
      ) as Record<SystemId, SystemAnswer>,
    };
  });

  return cachedTopics;
}
