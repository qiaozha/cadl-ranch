import { Scenario, ScenarioEndpoint } from "@azure-tools/cadl-ranch-expect";
import { writeFile } from "fs/promises";
import { logger } from "../logger.js";
import { loadScenarios } from "../scenarios-resolver.js";
import pc from "picocolors";
import prettier from "prettier";

export interface GenerateScenarioSummaryConfig {
  scenariosPath: string;
  outputFile: string;
}

export async function generateScenarioSummary({ scenariosPath, outputFile }: GenerateScenarioSummaryConfig) {
  const [scenarios, diagnostics] = await loadScenarios(scenariosPath);

  if (diagnostics.length > 0) {
    process.exit(-1);
  }

  const summary = createScenarioSummary(scenarios);
  await writeFile(outputFile, summary);
  logger.info(`${pc.green("✓")} Scenario summary generated at ${outputFile}.`);
}

export function createScenarioSummary(scenarios: Scenario[]): string {
  const lines = [`# Cadl Ranch Project summary`];

  for (const scenario of scenarios) {
    lines.push(`### ${scenario.name}`);
    lines.push("");
    const endpoints = renderEndpoints(scenario.endpoints);
    if (endpoints) {
      lines.push(...endpoints);
    }
    lines.push("");
    lines.push(`${scenario.scenarioDoc}`);
    lines.push("");
  }
  const markdown = lines.join("\n");

  return prettier.format(markdown, { parser: "markdown" });
}

function renderEndpoints(endpoints: ScenarioEndpoint[]) {
  if (endpoints.length === 0) {
    return undefined;
  } else if (endpoints.length === 1) {
    return [`- Endpoint: \`${endpoints[0].verb} ${endpoints[0].path}\``];
  } else {
    return [`- Endpoints:`, ...endpoints.map((x) => `  - \`${endpoints[0].verb} ${x.path}\``)];
  }
}
