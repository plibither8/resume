<script lang="ts">
  import { resume } from "$lib/stores";
  const { header } = $resume;
</script>

<header class="relative p-5 space-y-2 overflow-hidden bg-slate-50">
  <div class="flex items-baseline gap-5">
    <h1 class="text-2xl font-bold text-slate-700">{header.name}</h1>
    <p class="text-base text-slate-500 uppercase tracking-wider">
      {header.title}
    </p>
  </div>
  <img
    src={header.logo.path}
    alt={header.logo.alt}
    class="absolute w-20 opacity-50 -top-2 -right-1"
  />
</header>
