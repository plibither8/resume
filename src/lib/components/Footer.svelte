<script lang="ts">
  import { resume } from "$lib/stores";
  import Link from "./Link.svelte";
  const { meta } = $resume;
</script>

<footer
  class="flex items-center justify-between py-4 px-5 text-xs bg-slate-50 text-slate-400"
>
  <span>Last updated: {meta.lastUpdated}</span>
  <span>
    View on:
    <Link href={meta.viewOn.link} class="underline">
      {meta.viewOn.slug}
    </Link>
  </span>
</footer>
