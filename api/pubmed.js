// /api/pubmed.js
const fetch = global.fetch;
const API_KEY = process.env.PUBMED_API_KEY || "";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "";
const TOOL_NAME = process.env.TOOL_NAME || "trec-biogen-viewer";

function uaHeaders(){ return CONTACT_EMAIL ? { "User-Agent": `mailto:${CONTACT_EMAIL}` } : {}; }
function xmlGet(s, re){ const m = s.match(re); return m ? m[1] : ""; }
function stripTags(s){ return s.replace(/<[^>]+>/g, "").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'"); }

function parseArticles(xml){
  const out = [];
  const blocks = xml.split(/<\/PubmedArticle>/g);
  for (const b0 of blocks) {
    const b = b0 + "</PubmedArticle>";
    if (!/<PubmedArticle/.test(b)) continue;
    const pmid = xmlGet(b, /<PMID[^>]*>(\d+)<\/PMID>/);
    const title = stripTags(xmlGet(b, /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/));
    const journal = stripTags(xmlGet(b, /<Journal>[\s\S]*?<Title>([\s\S]*?)<\/Title>[\s\S]*?<\/Journal>/));
    let year = xmlGet(b, /<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>[\s\S]*?<\/PubDate>/) ||
               xmlGet(b, /<PubDate>[\s\S]*?<MedlineDate>(\d{4})/);
    const doi = xmlGet(b, /<ELocationID[^>]*EIdType="doi"[^>]*>([^<]+)<\/ELocationID>/);

    // abstract: join all AbstractText nodes (with Label if any)
    const absParts = [];
    const re = /<AbstractText([^>]*)>([\s\S]*?)<\/AbstractText>/g; let m;
    while ((m = re.exec(b))) {
      const label = xmlGet(m[1], /Label="([^"]+)"/);
      const text = stripTags(m[2]);
      absParts.push(label ? `${label}: ${text}` : text);
    }
    const abstract = absParts.join("\n\n");

    out.push({ pmid, title, journal, year, doi, abstract, url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : "" });
  }
  return out;
}

module.exports = async (req, res) => {
  try {
    const list = (req.query?.pmids ?? "").toString().split(/[,\s]+/).filter(x=>/^\d{5,9}$/.test(x)).slice(0, 50);
    if (!list.length) { res.status(400).json({ error: "Provide ?pmids=123,456" }); return; }

    const p = new URLSearchParams({ db:"pubmed", retmode:"xml", id:list.join(","), tool:TOOL_NAME });
    if (API_KEY) p.set("api_key", API_KEY);
    if (CONTACT_EMAIL) p.set("email", CONTACT_EMAIL);

    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${p.toString()}`;
    const r = await fetch(url, { headers: uaHeaders() });
    if (!r.ok) throw new Error(`efetch ${r.status}`);
    const xml = await r.text();
    const items = parseArticles(xml);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=600"); // 10 min edge cache
    res.status(200).json({ count: items.length, items });
  } catch (e) {
    res.status(200).json({ error: String(e?.message || e) });
  }
};
