<script lang="ts">
  export let href: string;
</script>

<a target="_blank" rel="noopener" {href} {...$$restProps}>
  <slot />
</a>
