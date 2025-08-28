<script lang="ts">
  import Link from "./Link.svelte";

  export let link: string;
  export let logo: string;
  export let name: string;
  export let color: string;
</script>

<Link href={link}>
  <img
    class="w-10 h-10 p-1.5 rounded-md"
    src={logo}
    alt="Logo of {name}"
    style="background-color: {color}11;"
  />
</Link>
