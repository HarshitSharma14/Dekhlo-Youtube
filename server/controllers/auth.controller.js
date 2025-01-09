export const signup = async (req, res, next) => {
  try {
    const { email } = req.body;
  } catch (err) {
    return resstatus(500).send("Internal Server Error");
  }
};
