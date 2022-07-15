<script lang="ts">
  export let heading: string;
</script>

<section class="space-y-3" {...$$restProps}>
  <h2
    class="
      flex items-baseline gap-2 text-sm font-bold tracking-wider uppercase
      text-slate-500 after:block after:flex-1 after:bg-slate-100 after:h-1
    "
  >
    {heading}
  </h2>

  <slot />
</section>
