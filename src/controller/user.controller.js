import { getMiniProfile } from "../services/user.services.js";

export const MiniProfile = async (req, res) => {
  try {
    const user = await getMiniProfile(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching mini profile", error: err.message });
  }
};