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
    <p>Last updated: {meta.lastUpdated}</p>
    <p>
      View on:
      <Link href={meta.viewOn.link} class="underline">
        {meta.viewOn.slug}
      </Link>
    </p>
  </aside>
</header>
