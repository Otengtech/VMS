import VehicleRecord from "../models/VehicleRecord.js";

export const getVehicleRecords = async (req, res) => {
  try {
    const records = await VehicleRecord.find()
      .populate("vehicle")
      .populate("driver");

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch records" });
  }
};

export const getVehicleRecordById = async (req, res) => {
  try {
    const record = await VehicleRecord.findById(req.params.id)
      .populate("vehicle")
      .populate("driver");

    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving record" });
  }
};

export const createVehicleRecord = async (req, res) => {
  try {
    const record = new VehicleRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: "Failed to create record" });
  }
};

export const updateVehicleRecord = async (req, res) => {
  try {
    const record = await VehicleRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(record);
  } catch (error) {
    res.status(400).json({ message: "Failed to update record" });
  }
};

export const deleteVehicleRecord = async (req, res) => {
  try {
    const record = await VehicleRecord.findByIdAndDelete(req.params.id);

    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete record" });
  }
};