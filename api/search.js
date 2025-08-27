const { SYSTEMS, SYSTEM_ANSWERS, searchItems } = require("./_data");

module.exports = async (req, res) => {
  try {
    const q = (req.query?.q ?? "").toString();
    const sysParam = (req.query?.systems ?? "").toString();
    let selected = Object.keys(SYSTEMS);
    if (sysParam.trim()) {
      const reqList = sysParam.split(",").map(s => s.trim()).filter(Boolean);
      selected = reqList.filter(s => SYSTEMS[s]);
      if (!selected.length) selected = Object.keys(SYSTEMS);
    }
    const items = searchItems(q);
    const payload = items.map(it => {
      const row = {
        id: it.id,
        question: it.question || "",
        topic: it.topic || "",
        narrative: it.narrative || "",
        answers: {}
      };
      for (const s of selected) {
        const ans = (SYSTEM_ANSWERS[s] && SYSTEM_ANSWERS[s][it.id]) || "";
        row.answers[s] = ans;
      }
      return row;
    });
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).send(JSON.stringify({ results: payload, count: payload.length, systems: selected }));
  } catch (e) {
    res.status(500).send({ error: e?.message || "Internal error" });
  }
};
