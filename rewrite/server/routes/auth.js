const router = require("express").Router();
const c = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

router.post("/register", c.register);
router.post("/login", c.login);
router.post("/refresh", c.refresh);
router.post("/logout", c.logout);
router.post("/forgot-password", c.forgotPassword);
router.post("/reset-password", c.resetPassword);
router.get("/me", requireAuth, c.me);
router.put("/me", requireAuth, c.updateProfile);

module.exports = router;
