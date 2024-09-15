import getModels from "@/models";

// npx migrate create init-employee-table
// npx migrate up init-employee-table

export async function up(): Promise<void> {
  try {
    const { Employee } = await getModels();
    const timCook = await Employee.create({
      staffId: 0,
      staffFName: "Tim",
      staffLName: "Cook",
      dept: "Leadership",
      position: "Human Resource Manager",
      country: "US, Cupertino",
      email: "tim.cook@apple.com",
      role: 1,
    });

    await Employee.create([
      {
        staffId: 1,
        staffFName: "Jane Apple",
        staffLName: "Seed",
        dept: "Engineering",
        position: "Staff",
        country: "Singapore",
        email: "jane.apple.seed@apple.com",
        reportingManager: timCook._id,
        role: 2,
      },
      {
        staffId: 2,
        staffFName: "John",
        staffLName: "Doe",
        dept: "Marketing",
        position: "Marketing Manager",
        country: "USA",
        email: "John.doe@example.com",
        reportingManager: timCook._id,
        role: 3,
      },
    ]);
  } catch (error) {
    console.error("Migration error:", error);
  }
}

export async function down(): Promise<void> {
  // Write migration here
}
