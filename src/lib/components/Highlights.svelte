<script lang="ts">
  import { resume } from "$lib/stores";
  import Section from "./Section.svelte";
  import List from "./List.svelte";
  const { highlights } = $resume;
</script>

<Section heading="Highlights">
  <List list={highlights} />
</Section>
