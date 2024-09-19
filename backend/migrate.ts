export default {
  uri: String(process.env.CONNECTION_STRING),
  collection: "migrations",
  migrationsPath: "./migrations",
  templatePath: "./migrations/template.ts",
  autosync: false,
};
