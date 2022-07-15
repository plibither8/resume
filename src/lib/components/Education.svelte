<script lang="ts">
  import { resume } from "$lib/stores";
  import Logo from "./Logo.svelte";
  import Section from "./Section.svelte";
  const { education } = $resume;
</script>

<Section heading="Education">
  {#each education as { name, link, logo, dates, degree, score }}
    <article class="flex gap-3">
      <Logo {name} {link} {logo} />

      <div class="flex-1 space-y-1">
        <div class="flex items-baseline justify-between">
          <h3 class="text-sm font-bold text-slate-700">
            {name}
          </h3>
          <span class="text-sm text-slate-500"
            >{dates.start} &ndash; {dates.end}</span
          >
        </div>
        <div class="flex items-baseline justify-between">
          <p class="text-sm text-slate-500">
            {degree}
          </p>
          <span class="text-xs text-slate-500">{score}</span>
        </div>
      </div>
    </article>
  {/each}
</Section>
