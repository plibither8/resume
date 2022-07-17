<script lang="ts">
  import { resume } from "$lib/stores";
  import Link from "./Link.svelte";
  const { header, meta } = $resume;
</script>

<header class="flex items-end justify-between p-5 bg-slate-50">
  <div class="flex gap-5 items-center">
    <img src={header.logo.path} alt={header.logo.alt} class="w-10" />
    <div class="flex flex-col">
      <h1 class="text-2xl font-bold text-slate-700">{header.name}</h1>
      <p class="text-base text-slate-500">
        {header.title}
      </p>
    </div>
  </div>
  <aside class="text-xs space-y-1 bg-slate-50 text-slate-400">
    <p>Last updated: <strong>{meta.lastUpdated}</strong></p>
    <p class="text-right">
      View on:
      {#each meta.viewOn as { name, link }, index}
        <Link href={link} class="underline">
          {name}
        </Link>
        {#if index !== meta.viewOn.length - 1}
          <span>&middot;</span>&nbsp;
        {/if}
      {/each}
    </p>
  </aside>
</header>
