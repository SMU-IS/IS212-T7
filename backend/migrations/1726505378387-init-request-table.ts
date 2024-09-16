import getModels from "@/models";
import mongoose from "mongoose";

export async function up(): Promise<void> {
  try {
    const { Request } = await getModels();
    const collectionName = Request.collection.name;
    await mongoose.connection.createCollection(collectionName);
  } catch (error) {
    console.error("Error:", error);
  }
}
