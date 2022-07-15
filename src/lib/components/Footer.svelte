<script lang="ts">
  import { resume } from "$lib/stores";
  import Link from "./Link.svelte";
  const { footer } = $resume;
</script>

<footer
  class="flex items-center justify-between py-4 px-5 text-xs bg-slate-50 text-slate-400"
>
  <span>Last updated: {footer.lastUpdated}</span>
  <span>
    View on:
    <Link href={footer.viewOn.link} class="underline">
      {footer.viewOn.slug}
    </Link>
  </span>
</footer>
