import yaml from "js-yaml";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const yamlFile = "/resume.yaml";
  const response = await fetch(yamlFile);
  const resume = yaml.load(await response.text()) as Resume;
  return { resume };
};
