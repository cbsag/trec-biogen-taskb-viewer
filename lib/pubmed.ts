const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const API_KEY = process.env.PUBMED_API_KEY ?? "";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "";
const TOOL_NAME = process.env.TOOL_NAME ?? "bioevidence-ai-demo";

export type PubMedCitation = {
  pmid: string;
  title: string;
  journal: string;
  year: string;
  doi: string;
  abstract?: string;
  url: string;
};

function requestParameters(values: Record<string, string>) {
  const params = new URLSearchParams({
    ...values,
    tool: TOOL_NAME,
  });
  if (API_KEY) params.set("api_key", API_KEY);
  if (CONTACT_EMAIL) params.set("email", CONTACT_EMAIL);
  return params;
}

function requestHeaders(): HeadersInit {
  return CONTACT_EMAIL ? { "User-Agent": `mailto:${CONTACT_EMAIL}` } : {};
}

async function pubmedFetch(endpoint: string, params: URLSearchParams) {
  const response = await fetch(`${PUBMED_BASE}/${endpoint}?${params}`, {
    headers: requestHeaders(),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`PubMed returned HTTP ${response.status}`);
  }

  return response;
}

function extractYear(value: string) {
  return value.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? "";
}

function extractDoi(value: string) {
  return (
    value.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i)?.[0] ?? ""
  );
}

function decodeXml(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .trim();
}

function firstMatch(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1] ?? "";
}

export async function searchPubMed(
  sentence: string,
  limit: number,
): Promise<{ query: string; pmids: string[]; citations: PubMedCitation[] }> {
  const query = buildCitationQuery(sentence);
  const searchResponse = await pubmedFetch(
    "esearch.fcgi",
    requestParameters({
      db: "pubmed",
      retmode: "json",
      sort: "relevance",
      retmax: String(limit),
      term: query,
    }),
  );
  const searchData = (await searchResponse.json()) as {
    esearchresult?: { idlist?: string[] };
  };
  const pmids = searchData.esearchresult?.idlist ?? [];
  const citations = await summarizePubMed(pmids);

  return { query, pmids, citations };
}

export async function summarizePubMed(
  pmids: string[],
): Promise<PubMedCitation[]> {
  if (!pmids.length) return [];

  const response = await pubmedFetch(
    "esummary.fcgi",
    requestParameters({
      db: "pubmed",
      retmode: "json",
      id: pmids.join(","),
    }),
  );
  const data = (await response.json()) as {
    result?: Record<
      string,
      {
        title?: string;
        fulljournalname?: string;
        source?: string;
        sortpubdate?: string;
        pubdate?: string;
        elocationid?: string;
      }
    >;
  };

  return pmids.flatMap((pmid) => {
    const record = data.result?.[pmid];
    if (!record) return [];

    return [
      {
        pmid,
        title: record.title ?? "",
        journal: record.fulljournalname ?? record.source ?? "",
        year: extractYear(record.sortpubdate ?? record.pubdate ?? ""),
        doi: extractDoi(record.elocationid ?? ""),
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      },
    ];
  });
}

export async function fetchPubMedArticles(
  pmids: string[],
): Promise<PubMedCitation[]> {
  const response = await pubmedFetch(
    "efetch.fcgi",
    requestParameters({
      db: "pubmed",
      retmode: "xml",
      id: pmids.join(","),
    }),
  );
  const xml = await response.text();

  return xml
    .split(/<\/PubmedArticle>/)
    .filter((block) => block.includes("<PubmedArticle"))
    .map((block) => {
      const pmid = firstMatch(block, /<PMID[^>]*>(\d+)<\/PMID>/);
      const abstractParts = [
        ...block.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g),
      ].map((match) => decodeXml(match[1]));

      return {
        pmid,
        title: decodeXml(
          firstMatch(block, /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/),
        ),
        journal: decodeXml(
          firstMatch(
            block,
            /<Journal>[\s\S]*?<Title>([\s\S]*?)<\/Title>[\s\S]*?<\/Journal>/,
          ),
        ),
        year:
          firstMatch(
            block,
            /<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>[\s\S]*?<\/PubDate>/,
          ) ||
          firstMatch(block, /<PubDate>[\s\S]*?<MedlineDate>(\d{4})/),
        doi: decodeXml(
          firstMatch(
            block,
            /<ELocationID[^>]*EIdType="doi"[^>]*>([^<]+)<\/ELocationID>/,
          ),
        ),
        abstract: abstractParts.join("\n\n"),
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    })
    .filter((article) => article.pmid);
}

function buildCitationQuery(sentence: string) {
  const normalized = sentence.replace(/\s+/g, " ").trim();
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "for",
    "to",
    "of",
    "in",
    "on",
    "by",
    "with",
    "is",
    "are",
    "was",
    "were",
    "be",
    "this",
    "that",
    "it",
    "as",
    "at",
    "from",
    "not",
  ]);
  const keywords = normalized
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token))
    .slice(0, 14);
  const keywordQuery = keywords.map((token) => `${token}[tiab]`).join(" AND ");
  const exactQuery = `"${normalized.replaceAll('"', "")}"[tiab]`;

  if (normalized.length <= 160 && keywordQuery) {
    return `(${exactQuery}) OR (${keywordQuery})`;
  }
  return keywordQuery || exactQuery;
}
