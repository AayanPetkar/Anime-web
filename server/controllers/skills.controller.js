// TODO: read from src/data/skills/**/*.json or a synced Firestore collection.
exports.getAllSkills = async (req, res) => {
  res.json({ skills: [] });
};

exports.getSkillById = async (req, res) => {
  res.status(501).json({ message: 'not implemented yet' });
};
