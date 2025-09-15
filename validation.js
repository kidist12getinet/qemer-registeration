const { body, validationResult } = require("express-validator")

// Validation middleware to handle errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// User profile validation
const validateProfileUpdate = [
  body("firstName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),

  body("lastName")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),

  body("password").optional().isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),

  handleValidationErrors,
]

// Course validation
const validateCourse = [
  body("crn")
    .isLength({ min: 1, max: 10 })
    .withMessage("CRN must be between 1 and 10 characters")
    .matches(/^[A-Z0-9]+$/)
    .withMessage("CRN must contain only uppercase letters and numbers"),

  body("title").isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),

  body("credits").isInt({ min: 1, max: 7 }).withMessage("Credits must be between 1 and 7"),

  body("instructor").isLength({ min: 2, max: 50 }).withMessage("Instructor name must be between 2 and 50 characters"),

  body("maxEnrollment").isInt({ min: 1, max: 100 }).withMessage("Max enrollment must be between 1 and 100"),

  body("price")
    .matches(/^ETB\s\d{1,3}(,\d{3})*$/)
    .withMessage('Price must be in format "ETB 1,000"'),

  body("status").isIn(["Active", "Inactive"]).withMessage("Status must be Active or Inactive"),

  body("description").isLength({ min: 10, max: 500 }).withMessage("Description must be between 10 and 500 characters"),

  handleValidationErrors,
]

// Registration validation
const validateRegistration = [
  body("courseCrn").notEmpty().withMessage("Course CRN is required"),

  body("phone")
    .matches(/^\+251[0-9]{9}$/)
    .withMessage("Phone number must be in format +251xxxxxxxxx"),

  body("gender").isIn(["Male", "Female"]).withMessage("Gender must be Male or Female"),

  body("schedule")
    .isIn(["Weekdays", "Evenings", "Weekends"])
    .withMessage("Schedule must be Weekdays, Evenings, or Weekends"),

  body("mode").isIn(["Online", "In-Person"]).withMessage("Mode must be Online or In-Person"),

  body("location").notEmpty().withMessage("Location is required"),

  body("hasPcDesktop").isIn(["Yes", "No"]).withMessage("PC/Desktop availability must be Yes or No"),

  handleValidationErrors,
]

// Registration window validation
const validateRegistrationWindow = [
  body("startDate")
    .isISO8601()
    .withMessage("Start date must be a valid date")
    .custom((value) => {
      const startDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (startDate < today) {
        throw new Error("Start date cannot be in the past")
      }
      return true
    }),

  body("endDate")
    .isISO8601()
    .withMessage("End date must be a valid date")
    .custom((value, { req }) => {
      const endDate = new Date(value)
      const startDate = new Date(req.body.startDate)

      if (endDate <= startDate) {
        throw new Error("End date must be after start date")
      }
      return true
    }),

  body("isOpen").optional().isBoolean().withMessage("isOpen must be a boolean"),

  handleValidationErrors,
]

module.exports = {
  validateProfileUpdate,
  validateCourse,
  validateRegistration,
  validateRegistrationWindow,
  handleValidationErrors,
}
