export type SystemId = "A" | "B" | "C" | "D" | "E";

export type EvidenceSentence = {
  text: string;
  citations: string[];
};

export type SystemAnswer = {
  runId: string;
  sentences: EvidenceSentence[];
};

export type SharedTaskTopic = {
  id: string;
  question: string;
  topic: string;
  narrative: string;
  answers: Record<SystemId, SystemAnswer>;
};

export type OfficialResult = {
  id: SystemId;
  label: string;
  answerPrecision: number;
  answerRecall: number;
  answerCompleteness: number;
  answerCorrectness: number;
  citationCoverage: number;
  citationSupport: number;
  citationContradiction: number;
};
