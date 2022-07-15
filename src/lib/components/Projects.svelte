<script lang="ts">
  import { resume } from "$lib/stores";
  import Section from "./Section.svelte";
  import List from "./List.svelte";
  import Link from "./Link.svelte";
  const { projects } = $resume;
</script>

<Section heading="Projects" class="space-y-5">
  <div class="grid grid-cols-2 gap-y-5 gap-x-10">
    {#each projects as { name, subtitle, link, links, description }}
      <article class="space-y-2">
        <header class="space-y-1">
          <h3 class="text-sm font-bold text-slate-700">
            <Link href={link}>
              {name}
              <span class="ml-2 font-normal text-slate-500">
                {subtitle}
              </span>
            </Link>
          </h3>
          <p class="space-x-1 text-xs text-slate-500">
            {#each links as item, index}
              <Link href={item.link} class="underline">
                {item.name}
              </Link>
              {#if index !== links.length - 1}
                <span>&middot;</span>&nbsp;
              {/if}
            {/each}
          </p>
        </header>
        <List list={description} />
      </article>
    {/each}
  </div>
</Section>
