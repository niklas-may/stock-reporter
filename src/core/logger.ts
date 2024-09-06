import { createConsola } from "consola";
import pkg from "../../package.json" assert { type: "json" };

export const logger = createConsola({fancy: true}).withTag(pkg.name);
