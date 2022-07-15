<script lang="ts">
  import snarkdown from "snarkdown";
  export let list: string[];

  let listElement: HTMLUListElement;
  $: if (listElement) {
    const anchors = listElement.querySelectorAll("a");
    for (const anchor of anchors) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener");
    }
  }
</script>

<ul
  bind:this={listElement}
  class="space-y-1.5 text-xs leading-normal text-slate-600"
>
  {#each list as line}
    <li class="list-item list-[circle] ml-4">
      {@html snarkdown(line)}
    </li>
  {/each}
</ul>

<style lang="postcss">
  :global(.list-item a) {
    @apply underline;
  }
</style>
