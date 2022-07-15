<script lang="ts">
  import { resume } from "$lib/stores";
  import Link from "./Link.svelte";
  const { navigation } = $resume;
</script>

<nav class="flex px-5 py-3 text-sm bg-slate-100 gap-7 text-slate-700">
  {#each navigation as { name, alias, link }}
    <Link href={link}>
      <span class="text-slate-500">{name} </span>
      <strong>{alias}</strong>
    </Link>
  {/each}
</nav>
