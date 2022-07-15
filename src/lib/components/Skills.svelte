<script lang="ts">
  import { resume } from "$lib/stores";
  import Section from "./Section.svelte";
  const { skills } = $resume;
</script>

<Section heading="Skills">
  <ul class="space-y-1.5 text-xs leading-normal text-slate-700">
    {#each skills as { type, items }}
      <li class="space-x-1 list-[circle] ml-4">
        <strong>{type}:</strong>
        <span>{items.join(", ")}</span>
      </li>
    {/each}
  </ul>
</Section>
