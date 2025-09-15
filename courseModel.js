// courses/courseModel.js
const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema(
  {
    crn: {
      type: String,
      required: [true, "CRN is required"],
      unique: true,
      trim: true,
      maxlength: [10, "CRN must not exceed 10 characters"],
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: [1, "Credits must be at least 1"],
      max: [7, "Credits must not exceed 7"],
    },
    instructor: {
      type: String,
      required: [true, "Instructor name is required"],
      trim: true,
    },
    maxEnrollment: {
      type: Number,
      required: [true, "Maximum enrollment is required"],
      min: [1, "Maximum enrollment must be at least 1"],
    },
    currentEnrollment: {
      type: Number,
      default: 0,
    },
    prerequisites: [
      {
        type: String,
      },
    ],
    corequisites: [
      {
        type: String,
      },
    ],
    price: {
      type: String,
      required: [true, "Price is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Course", CourseSchema)
