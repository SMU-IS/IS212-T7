const mongoose = require("mongoose");

// Counter Schema to allow auto increment of RequestId
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

// input id --> requestId
async function initializeCounter(id: String) {
  const counter = await Counter.findById(id);
  if (!counter) {
    await new Counter({ _id: id, seq: 0 }).save();
  }
}

export { initializeCounter, Counter };
