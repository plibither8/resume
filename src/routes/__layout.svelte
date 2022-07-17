<script>
  import "../app.css";
</script>

<div class="p-10">
  <slot />
</div>

<style lang="postcss">
  @media print {
    div {
      @apply p-0;
    }
  }
</style>
