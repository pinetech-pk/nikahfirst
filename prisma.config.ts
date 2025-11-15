import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import path from "path";

type Env = {
  DATABASE_URL: string;
};
export default defineConfig({
  engine: "classic",
  datasource: {
    url: env<Env>("DATABASE_URL"),
  },
  schema: path.join("prisma", "schema.prisma"),
});
