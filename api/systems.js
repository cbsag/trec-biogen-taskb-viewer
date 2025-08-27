const { SYSTEMS, loadDescriptions } = require("./_data");

module.exports = async (req, res) => {
  try {
    const desc = loadDescriptions();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).send(JSON.stringify({ systems: Object.keys(SYSTEMS), descriptions: desc }));
  } catch (e) {
    res.status(500).send({ error: e?.message || "Internal error" });
  }
};
