import Driver from "../models/Driver.js";

export const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate("vehicleAssigned");
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch drivers" });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate("vehicleAssigned");

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving driver" });
  }
};

export const createDriver = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(400).json({ message: "Failed to create driver" });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: "Failed to update driver" });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) return res.status(404).json({ message: "Driver not found" });

    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete driver" });
  }
};