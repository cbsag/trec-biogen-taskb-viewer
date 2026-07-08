"use client";

import { useMemo, useState } from "react";

import type { OfficialResult } from "@/lib/types";

type MetricKey =
  | "answerPrecision"
  | "answerRecall"
  | "answerCompleteness"
  | "answerCorrectness"
  | "citationCoverage"
  | "citationSupport"
  | "citationContradiction";

const metricOptions: Array<{
  key: MetricKey;
  label: string;
  direction: "higher" | "lower";
}> = [
  { key: "answerPrecision", label: "Answer precision", direction: "higher" },
  { key: "answerRecall", label: "Answer recall", direction: "higher" },
  {
    key: "answerCompleteness",
    label: "Answer completeness",
    direction: "higher",
  },
  {
    key: "answerCorrectness",
    label: "Answer correctness",
    direction: "higher",
  },
  {
    key: "citationCoverage",
    label: "Citation coverage",
    direction: "higher",
  },
  {
    key: "citationSupport",
    label: "Citation support rate",
    direction: "higher",
  },
  {
    key: "citationContradiction",
    label: "Citation contradiction rate",
    direction: "lower",
  },
];

export function ResultsChart({ results }: { results: OfficialResult[] }) {
  const [metricKey, setMetricKey] =
    useState<MetricKey>("answerPrecision");
  const metric = metricOptions.find((option) => option.key === metricKey)!;

  const ranked = useMemo(
    () =>
      [...results].sort((a, b) =>
        metric.direction === "higher"
          ? b[metricKey] - a[metricKey]
          : a[metricKey] - b[metricKey],
      ),
    [metric.direction, metricKey, results],
  );
  const scaleMax =
    metricKey === "citationContradiction"
      ? Math.max(...results.map((result) => result[metricKey])) * 1.15
      : 100;

  return (
    <div className="results-chart">
      <div className="chart-toolbar">
        <div>
          <span className="section-kicker">Interactive metric view</span>
          <h2>{metric.label}</h2>
        </div>
        <label>
          <span>Metric</span>
          <select
            value={metricKey}
            onChange={(event) => setMetricKey(event.target.value as MetricKey)}
          >
            {metricOptions.map((option) => (
              <option value={option.key} key={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="chart-note">
        {metric.direction === "higher" ? "Higher" : "Lower"} is better. Values
        are official percentages reported in the TREC 2025 proceedings paper.
      </p>
      <div className="bar-chart">
        {ranked.map((result, index) => {
          const value = result[metricKey];
          return (
            <div className="bar-row" key={result.id}>
              <span className="bar-rank">{index + 1}</span>
              <span className={`system-key system-${result.id.toLowerCase()}`}>
                {result.id}
              </span>
              <strong>{result.label}</strong>
              <div className="bar-track">
                <i style={{ width: `${Math.max((value / scaleMax) * 100, 2)}%` }} />
              </div>
              <b>{value.toFixed(2)}</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}
