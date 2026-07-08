"use client";

import {
  ExternalLink,
  GitCompareArrows,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { systemById, systems } from "@/lib/systems";
import type {
  SharedTaskTopic,
  SystemAnswer,
  SystemId,
} from "@/lib/types";

type ExplorerProps = {
  topics: SharedTaskTopic[];
};

const allSystemIds = systems.map((system) => system.id);
const suggestions = ["axonal injury", "statin", "sepsis", "181"];

function AnswerView({
  answer,
  density,
  systemId,
}: {
  answer: SystemAnswer;
  density: "comfortable" | "spacious";
  systemId: SystemId;
}) {
  const system = systemById[systemId];
  const citationCount = new Set(
    answer.sentences.flatMap((sentence) => sentence.citations),
  ).size;

  return (
    <article
      className={`answer-reading answer-${density}`}
      key={`${systemId}-${answer.runId}`}
    >
      <header>
        <div>
          <span className={`system-key system-${systemId.toLowerCase()}`}>
            {systemId}
          </span>
          <div>
            <strong>{system.name}</strong>
            <small>{system.family}</small>
          </div>
        </div>
        <span>{citationCount} cited papers</span>
      </header>

      <details className="method-disclosure">
        <summary>Run method</summary>
        <p>{system.summary}</p>
        <div className="mini-stage-line">
          {system.stages.map((stage) => (
            <span key={stage}>{stage}</span>
          ))}
        </div>
      </details>

      <div className="answer-prose">
        {answer.sentences.map((sentence, index) => (
          <p key={`${systemId}-${index}`}>
            {sentence.text}{" "}
            {sentence.citations.map((pmid) => (
              <a
                className="citation-link"
                href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
                target="_blank"
                rel="noreferrer"
                key={`${systemId}-${index}-${pmid}`}
                title={`Open PMID ${pmid} in PubMed`}
              >
                {pmid}
              </a>
            ))}
          </p>
        ))}
      </div>
    </article>
  );
}

export function SystemExplorer({ topics }: ExplorerProps) {
  const [searchText, setSearchText] = useState("");
  const [query, setQuery] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [enabledSystems, setEnabledSystems] =
    useState<SystemId[]>(allSystemIds);
  const [primarySystem, setPrimarySystem] = useState<SystemId>("A");
  const [secondarySystem, setSecondarySystem] = useState<SystemId>("D");
  const [compare, setCompare] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [density, setDensity] =
    useState<"comfortable" | "spacious">("comfortable");

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return topics.filter((topic) =>
      [topic.id, topic.question, topic.topic, topic.narrative]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, topics]);

  const selectedTopic =
    matches.find((topic) => topic.id === selectedTopicId) ?? matches[0];

  const activeSystem = enabledSystems.includes(primarySystem)
    ? primarySystem
    : enabledSystems[0];
  const comparisonSystem =
    enabledSystems.includes(secondarySystem) &&
    secondarySystem !== activeSystem
      ? secondarySystem
      : enabledSystems.find((systemId) => systemId !== activeSystem);

  const evidence = useMemo(() => {
    if (!selectedTopic || !activeSystem) return [];
    const selectedSystems =
      compare && comparisonSystem
        ? [activeSystem, comparisonSystem]
        : [activeSystem];
    const map = new Map<string, Set<SystemId>>();
    for (const systemId of selectedSystems) {
      for (const sentence of selectedTopic.answers[systemId].sentences) {
        for (const pmid of sentence.citations) {
          const citedBy = map.get(pmid) ?? new Set<SystemId>();
          citedBy.add(systemId);
          map.set(pmid, citedBy);
        }
      }
    }
    return [...map.entries()].map(([pmid, citedBy]) => ({
      pmid,
      systems: [...citedBy],
    }));
  }, [activeSystem, compare, comparisonSystem, selectedTopic]);

  function runSearch(value: string) {
    const nextQuery = value.trim();
    setSearchText(nextQuery);
    setQuery(nextQuery);
    setSelectedTopicId("");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submittedQuery = String(formData.get("topic-query") ?? "");
    runSearch(submittedQuery);
  }

  function toggleSystem(systemId: SystemId) {
    const isEnabled = enabledSystems.includes(systemId);
    if (isEnabled && enabledSystems.length === 1) return;

    const next = isEnabled
      ? enabledSystems.filter((id) => id !== systemId)
      : [...enabledSystems, systemId].sort();
    setEnabledSystems(next);

    if (systemId === primarySystem && isEnabled) {
      setPrimarySystem(next[0]);
    }
    if (systemId === secondarySystem && isEnabled) {
      setSecondarySystem(next.find((id) => id !== primarySystem) ?? next[0]);
    }
    if (next.length < 2) setCompare(false);
  }

  function clearSearch() {
    setSearchText("");
    setQuery("");
    setSelectedTopicId("");
  }

  return (
    <div className="search-viewer">
      <form className="search-bar" onSubmit={submitSearch}>
        <Search size={20} aria-hidden="true" />
        <label className="sr-only" htmlFor="topic-query">
          Search BioEvidence AI topics
        </label>
        <input
          id="topic-query"
          name="topic-query"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by ID, question, topic, or narrative"
          autoComplete="off"
        />
        {searchText && (
          <button
            className="clear-search"
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            title="Clear search"
          >
            <X size={17} aria-hidden="true" />
          </button>
        )}
        <button className="search-submit" type="submit">
          Search
        </button>
      </form>

      <div className="search-underbar">
        <div className="suggested-searches" aria-label="Suggested searches">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              onClick={() => runSearch(suggestion)}
              key={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <button
          className="options-toggle"
          type="button"
          aria-expanded={showOptions}
          onClick={() => setShowOptions((visible) => !visible)}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          Options
        </button>
      </div>

      {showOptions && (
        <div className="viewer-options">
          <fieldset>
            <legend>Systems</legend>
            {systems.map((system) => (
              <label key={system.id}>
                <input
                  type="checkbox"
                  checked={enabledSystems.includes(system.id)}
                  onChange={() => toggleSystem(system.id)}
                />
                <span>{system.id}</span>
                {system.name}
              </label>
            ))}
          </fieldset>
          <label className="density-control">
            <span>Reading</span>
            <select
              value={density}
              onChange={(event) =>
                setDensity(event.target.value as "comfortable" | "spacious")
              }
            >
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </label>
        </div>
      )}

      {!query && (
        <div className="search-welcome">
          <span>TREC 2025 · Task B</span>
          <h2>Search the official questions.</h2>
          <p>30 topics · 5 submitted systems · sentence-level PubMed citations</p>
        </div>
      )}

      {query && !matches.length && (
        <div className="no-results">
          <h2>No matching topics</h2>
          <p>Try a shorter clinical term or a topic ID from 181 to 210.</p>
        </div>
      )}

      {selectedTopic && activeSystem && (
        <section className="search-result" aria-live="polite">
          <div className="result-context">
            <div className="result-count">
              <strong>{matches.length}</strong>
              <span>{matches.length === 1 ? "result" : "results"}</span>
            </div>
            {matches.length > 1 && (
              <label>
                <span className="sr-only">Select a matching topic</span>
                <select
                  value={selectedTopic.id}
                  onChange={(event) => setSelectedTopicId(event.target.value)}
                >
                  {matches.map((topic) => (
                    <option value={topic.id} key={topic.id}>
                      {topic.id} · {topic.question}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <header className="result-question">
            <span>
              Topic {selectedTopic.id} · {selectedTopic.topic}
            </span>
            <h2>{selectedTopic.question}</h2>
            <details>
              <summary>Clinical narrative</summary>
              <p>{selectedTopic.narrative}</p>
            </details>
          </header>

          <div className="answer-controls">
            <div className="system-tabs" aria-label="Select system output">
              {systems
                .filter((system) => enabledSystems.includes(system.id))
                .map((system) => (
                  <button
                    type="button"
                    className={activeSystem === system.id ? "active" : ""}
                    onClick={() => setPrimarySystem(system.id)}
                    key={system.id}
                  >
                    <span>{system.id}</span>
                    {system.name}
                  </button>
                ))}
            </div>
            {enabledSystems.length > 1 && (
              <button
                className={compare ? "compare-action active" : "compare-action"}
                type="button"
                onClick={() => setCompare((enabled) => !enabled)}
              >
                <GitCompareArrows size={15} aria-hidden="true" />
                {compare ? "Stop comparing" : "Compare"}
              </button>
            )}
          </div>

          {compare && comparisonSystem && (
            <div className="compare-picker">
              <label htmlFor="comparison-system">Compare with</label>
              <select
                id="comparison-system"
                value={comparisonSystem}
                onChange={(event) =>
                  setSecondarySystem(event.target.value as SystemId)
                }
              >
                {systems
                  .filter(
                    (system) =>
                      enabledSystems.includes(system.id) &&
                      system.id !== activeSystem,
                  )
                  .map((system) => (
                    <option value={system.id} key={system.id}>
                      System {system.id} · {system.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className={compare ? "reading-grid compare" : "reading-grid"}>
            <AnswerView
              answer={selectedTopic.answers[activeSystem]}
              density={density}
              systemId={activeSystem}
            />
            {compare && comparisonSystem && (
              <AnswerView
                answer={selectedTopic.answers[comparisonSystem]}
                density={density}
                systemId={comparisonSystem}
              />
            )}
          </div>

          <details className="evidence-disclosure">
            <summary>{evidence.length} unique cited PubMed records</summary>
            <div>
              {evidence.map((item) => (
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`}
                  target="_blank"
                  rel="noreferrer"
                  key={item.pmid}
                >
                  <span>PMID {item.pmid}</span>
                  <small>
                    {item.systems.map((id) => `System ${id}`).join(" · ")}
                  </small>
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              ))}
            </div>
          </details>
        </section>
      )}
    </div>
  );
}
