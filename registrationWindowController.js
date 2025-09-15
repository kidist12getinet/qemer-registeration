const RegistrationWindow = require("./registrationWindowModel")

// @desc    Get current registration window
// @route   GET /api/registration-windows/current
// @access  Public
const getCurrentWindow = async (req, res) => {
  try {
    const now = new Date()
    const registrationWindow = await RegistrationWindow.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isOpen: true,
    }).sort({ startDate: -1 })

    if (registrationWindow) {
      res.json(registrationWindow)
    } else {
      // Get the next upcoming window
      const upcomingWindow = await RegistrationWindow.findOne({
        startDate: { $gt: now },
        isOpen: true,
      }).sort({ startDate: 1 })

      if (upcomingWindow) {
        res.json({ ...upcomingWindow.toObject(), status: "upcoming" })
      } else {
        // Get the most recent past window
        const pastWindow = await RegistrationWindow.findOne({
          endDate: { $lt: now },
        }).sort({ endDate: -1 })

        if (pastWindow) {
          res.json({ ...pastWindow.toObject(), status: "closed" })
        } else {
          res.status(404).json({ message: "No registration windows found" })
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all registration windows
// @route   GET /api/registration-windows
// @access  Private/Admin
const getAllWindows = async (req, res) => {
  try {
    const registrationWindows = await RegistrationWindow.find({}).sort({ startDate: -1 })
    res.json(registrationWindows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create registration window with validation
// @route   POST /api/registration-windows
// @access  Private/Admin
const createWindow = async (req, res) => {
  try {
    const { startDate, endDate, isOpen, description } = req.body

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    // Remove time component for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())

    if (startDateOnly < today) {
      return res.status(400).json({
        message: "Start date cannot be in the past",
        field: "startDate",
      })
    }

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date",
        field: "endDate",
      })
    }

    // Check for overlapping windows
    const overlappingWindow = await RegistrationWindow.findOne({
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
      isOpen: true,
    })

    if (overlappingWindow) {
      return res.status(400).json({
        message: "Registration window overlaps with existing active window",
        existingWindow: {
          startDate: overlappingWindow.startDate,
          endDate: overlappingWindow.endDate,
        },
      })
    }

    const registrationWindow = new RegistrationWindow({
      startDate: start,
      endDate: end,
      isOpen: isOpen !== undefined ? isOpen : true,
      description,
      createdBy: req.user.id,
    })

    const createdWindow = await registrationWindow.save()
    res.status(201).json({
      success: true,
      message: "Registration window created successfully",
      data: createdWindow,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update registration window with validation
// @route   PUT /api/registration-windows/:id
// @access  Private/Admin
const updateWindow = async (req, res) => {
  try {
    const { startDate, endDate, isOpen, description } = req.body
    const registrationWindow = await RegistrationWindow.findById(req.params.id)

    if (!registrationWindow) {
      return res.status(404).json({ message: "Registration window not found" })
    }

    // Validate dates if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : registrationWindow.startDate
      const end = endDate ? new Date(endDate) : registrationWindow.endDate
      const now = new Date()

      // Remove time component for date comparison
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())

      if (startDateOnly < today) {
        return res.status(400).json({
          message: "Start date cannot be in the past",
          field: "startDate",
        })
      }

      if (end <= start) {
        return res.status(400).json({
          message: "End date must be after start date",
          field: "endDate",
        })
      }
    }

    // Update fields
    if (startDate) registrationWindow.startDate = new Date(startDate)
    if (endDate) registrationWindow.endDate = new Date(endDate)
    if (isOpen !== undefined) registrationWindow.isOpen = isOpen
    if (description !== undefined) registrationWindow.description = description
    registrationWindow.updatedBy = req.user.id

    const updatedWindow = await registrationWindow.save()
    res.json({
      success: true,
      message: "Registration window updated successfully",
      data: updatedWindow,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete registration window
// @route   DELETE /api/registration-windows/:id
// @access  Private/Admin
const deleteWindow = async (req, res) => {
  try {
    const registrationWindow = await RegistrationWindow.findById(req.params.id)

    if (!registrationWindow) {
      return res.status(404).json({ message: "Registration window not found" })
    }

    await registrationWindow.deleteOne()
    res.json({ message: "Registration window removed" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getCurrentWindow,
  getAllWindows,
  createWindow,
  updateWindow,
  deleteWindow,
}
