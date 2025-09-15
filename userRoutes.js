const express = require("express")
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require("./userController")
const { protect } = require("../middleware/auth.js")
const { validateProfileUpdate } = require("../middleware/validation")

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.route("/profile").get(protect, getUserProfile).put(protect, validateProfileUpdate, updateUserProfile)

module.exports = router
