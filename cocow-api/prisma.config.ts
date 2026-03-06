/// <reference types="node" />
import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://cocow_user:cocow_pass@localhost:5432/cocow",
  },
});
