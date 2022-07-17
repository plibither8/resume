<script context="module" lang="ts">
  import yaml from "js-yaml";

  /** @type {import('./__types').Load} */
  export async function load({ fetch }) {
    const yamlFile = "/resume.yaml";
    const response = await fetch(yamlFile);
    const resume = yaml.load(await response.text()) as Resume;
    return { props: { resume } };
  }
</script>

<script lang="ts">
  import { resume } from "$lib/stores";
  import Highlights from "$lib/components/Highlights.svelte";
  import Education from "$lib/components/Education.svelte";
  import Experience from "$lib/components/Experience.svelte";
  import Header from "$lib/components/Header.svelte";
  import Navigation from "$lib/components/Navigation.svelte";
  import Projects from "$lib/components/Projects.svelte";
  import Skills from "$lib/components/Skills.svelte";

  const width = 1000;
  const ratio = Math.SQRT1_2 * 1.001;

  $resume = $$props.resume as Resume;
</script>

<svelte:head>
  <title>{$resume.meta.title}'s Resume</title>
</svelte:head>

<main
  style="width: {width}px; aspect-ratio: {ratio};"
  class="overflow-hidden mx-auto my-10 shadow-md rounded-lg"
>
  <Header />

  <Navigation />

  <div class="p-7 space-y-7">
    <Education />

    <Experience />

    <Projects />

    <div class="grid grid-cols-2 gap-7">
      <Highlights />

      <Skills />
    </div>
  </div>
</main>

<style lang="postcss">
  @media print {
    main {
      @apply my-0 shadow-none rounded-none;
    }
  }
</style>
