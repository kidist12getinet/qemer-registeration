const express = require("express")
const {
  getCurrentWindow,
  getAllWindows,
  createWindow,
  updateWindow,
  deleteWindow,
} = require("./registrationWindowController")
const { protect, admin } = require("../middleware/auth")
const { validateRegistrationWindow } = require("../middleware/validation")

const router = express.Router()

router.get("/current", getCurrentWindow)
router.route("/").get(protect, admin, getAllWindows).post(protect, admin, validateRegistrationWindow, createWindow)
router.route("/:id").put(protect, admin, validateRegistrationWindow, updateWindow).delete(protect, admin, deleteWindow)

module.exports = router
