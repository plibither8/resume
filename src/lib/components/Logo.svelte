<script lang="ts">
  import Link from "./Link.svelte";

  export let link: string;
  export let logo: string;
  export let name: string;
</script>

<Link href={link}>
  <img
    class="w-10 h-10 p-1.5 rounded-md shadow-md"
    src={logo}
    alt="Logo of {name}"
  />
</Link>
