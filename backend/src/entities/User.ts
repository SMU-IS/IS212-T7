import mongoose from "mongoose";

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: String,
  email: String,
});

export default mongoose.model("User", UserSchema);
