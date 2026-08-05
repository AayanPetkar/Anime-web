// TODO: back with Firestore/Supabase.
exports.getUserProgress = async (req, res) => {
  res.json({ progress: null });
};

exports.updateUserProgress = async (req, res) => {
  res.status(501).json({ message: 'not implemented yet' });
};
