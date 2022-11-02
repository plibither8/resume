<script lang="ts">
  import { resume } from "$lib/stores";
  import Section from "./Section.svelte";
  import List from "./List.svelte";
  import Link from "./Link.svelte";
  import Logo from "./Logo.svelte";
  const { experience } = $resume;
</script>

<Section heading="Experience" class="space-y-5">
  {#each experience as { name, branding, link, links, dates, role, location, description = null }}
    <article class="flex gap-3">
      <aside class="flex flex-col items-center gap-5">
        <Logo {name} {link} logo={branding.logo} />
        {#if description}
          <div
            class="w-1 h-full rounded-md opacity-20"
            style="background: {branding.color}"
          />
        {/if}
      </aside>

      <div class="flex-1 space-y-2">
        <!-- Name and dates -->
        <header class="flex-1 space-y-0.5">
          <div class="flex items-baseline justify-between">
            <div class="flex items-baseline gap-2">
              <h3 class="text-sm font-bold text-slate-700">
                <Link href={link}>{name}</Link>
              </h3>
              <p class="text-sm text-slate-500">
                {role}
              </p>
            </div>
            <span class="text-sm text-slate-500">
              {dates.start}
              {dates.end ? `– ${dates.end}` : ""}
            </span>
          </div>

          <!-- Role and location -->
          <div class="flex items-baseline justify-between">
            <p class="space-x-1 text-xs text-slate-500">
              {#each links as item, index}
                <Link href={item.link} class="underline">
                  {item.name}
                </Link>
                {#if index !== links.length - 1}
                  <span>&middot;</span>&nbsp;
                {/if}
              {/each}
            </p>
            <span class="text-xs text-slate-500"> {location} </span>
          </div>
        </header>

        <!-- Description -->
        {#if description}
          <List list={description} />
        {/if}
      </div>
    </article>
  {/each}
</Section>
