<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { ChevronDown, ChevronRight, Search } from '@lucide/svelte';
	import type { LeagueFeatureCollection, Team, Organization } from '$lib/types';
	import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '$lib/components/ui/sidebar';
	import { filterLeagues } from '$lib/utils';

	let {
		geojson,
		teams = [],
		organizations = []
	}: {
		geojson: LeagueFeatureCollection;
		teams: Team[];
		organizations: Organization[];
	} = $props();

	// --- Derive filter options from data ---
	let countries = $derived(
		[
			...new Set(
				geojson.features.map((f) => f.properties.country).filter((c): c is string => c !== null)
			)
		].sort((a, b) => a.localeCompare(b))
	);

	let usedOrgIds = $derived(
		new Set(teams.flatMap((t) => t.affiliation?.map((a) => a.organization_id) ?? []))
	);
	let orgOptions = $derived(
		organizations
			.filter((o) => usedOrgIds.has(o.id))
			.map((o) => ({ id: o.id, name: o.organization_name }))
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	let teamTypes = $derived(
		[...new Set(teams.map((t) => t.team_type).filter((t): t is string => t !== null))].sort()
	);

	// --- Selected values from URL (guarded for prerendering) ---
	let selectedCountries = $derived(browser ? page.url.searchParams.getAll('country') : []);
	let selectedOrgs = $derived(browser ? page.url.searchParams.getAll('organization') : []);
	let selectedTeamTypes = $derived(browser ? page.url.searchParams.getAll('team_type') : []);

	let activeCount = $derived(
		selectedCountries.length + selectedOrgs.length + selectedTeamTypes.length
	);

	// Number of leagues matching the current filters ("X of Y leagues").
	let filteredCount = $derived(
		filterLeagues(geojson, teams, {
			countries: selectedCountries,
			organizations: selectedOrgs,
			teamTypes: selectedTeamTypes
		}).features.length
	);
	let totalCount = $derived(geojson.features.length);

	// --- UI state for collapsible sections ---
	let countryOpen = $state(false);
	let orgOpen = $state(false);
	let teamTypeOpen = $state(false);
	let countrySearch = $state('');

	let filteredCountries = $derived(
		countrySearch.trim()
			? countries.filter((c) => c.toLowerCase().includes(countrySearch.toLowerCase()))
			: countries
	);

	// --- Actions ---
	function toggleParam(param: string, value: string) {
		const url = new URL(page.url);
		const all = url.searchParams.getAll(param);
		url.searchParams.delete(param);
		const newValues = all.includes(value) ? all.filter((v) => v !== value) : [...all, value];
		for (const v of newValues) {
			url.searchParams.append(param, v);
		}
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url, { keepFocus: true, noScroll: true, replaceState: true });
	}

	function clearAll() {
		if (activeCount === 0) return;
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(page.url.pathname, { keepFocus: true, noScroll: true, replaceState: true });
	}

	function isChecked(arr: string[], value: string): boolean {
		return arr.includes(value);
	}
</script>

<SidebarGroup>
	<SidebarGroupLabel class="flex items-center justify-between">
		<span>Filters</span>
		{#if activeCount > 0}
			<div class="flex items-center gap-2">
				<span class="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
					{filteredCount} of {totalCount} leagues
				</span>
				<button
					type="button"
					onclick={clearAll}
					class="text-[10px] font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
				>
					Clear
				</button>
			</div>
		{/if}
	</SidebarGroupLabel>
	<SidebarGroupContent>
		<div class="space-y-px">
			<!-- Country -->
			<div class="border-b border-border/50">
				<button
					type="button"
					onclick={() => (countryOpen = !countryOpen)}
					class="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
				>
					{#if countryOpen}
						<ChevronDown class="size-3 shrink-0" />
					{:else}
						<ChevronRight class="size-3 shrink-0" />
					{/if}
					<span>Country</span>
					{#if selectedCountries.length > 0}
						<span
							class="ml-auto inline-flex items-center justify-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary"
						>
							{selectedCountries.length}
						</span>
					{/if}
				</button>
				{#if countryOpen}
					<div class="space-y-1 px-2 pb-2">
						<div class="relative">
							<Search
								class="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground"
							/>
							<input
								type="text"
								bind:value={countrySearch}
								placeholder="Search…"
								class="w-full rounded-md border border-input bg-background py-1 pr-2 pl-7 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
							/>
						</div>
						<div class="max-h-48 space-y-0.5 overflow-y-auto">
							{#each filteredCountries as country (country)}
								<label
									class="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted"
								>
									<input
										type="checkbox"
										class="size-3.5 shrink-0 rounded border-input accent-primary"
										checked={isChecked(selectedCountries, country)}
										onchange={() => toggleParam('country', country)}
									/>
									<span class="truncate text-xs">{country}</span>
								</label>
							{:else}
								<p class="px-1.5 py-2 text-xs text-muted-foreground">No countries found</p>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Organization -->
			<div class="border-b border-border/50">
				<button
					type="button"
					onclick={() => (orgOpen = !orgOpen)}
					class="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
				>
					{#if orgOpen}
						<ChevronDown class="size-3 shrink-0" />
					{:else}
						<ChevronRight class="size-3 shrink-0" />
					{/if}
					<span>Organization</span>
					{#if selectedOrgs.length > 0}
						<span
							class="ml-auto inline-flex items-center justify-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary"
						>
							{selectedOrgs.length}
						</span>
					{/if}
				</button>
				{#if orgOpen}
					<div class="space-y-0.5 px-2 pb-2">
						{#each orgOptions as org (org.id)}
							<label
								class="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted"
							>
								<input
									type="checkbox"
									class="size-3.5 shrink-0 rounded border-input accent-primary"
									checked={isChecked(selectedOrgs, org.id)}
									onchange={() => toggleParam('organization', org.id)}
								/>
								<span class="truncate text-xs">{org.name}</span>
							</label>
						{:else}
							<p class="px-1.5 py-2 text-xs text-muted-foreground">No organizations available</p>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Team type -->
			<div>
				<button
					type="button"
					onclick={() => (teamTypeOpen = !teamTypeOpen)}
					class="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
				>
					{#if teamTypeOpen}
						<ChevronDown class="size-3 shrink-0" />
					{:else}
						<ChevronRight class="size-3 shrink-0" />
					{/if}
					<span>Team type</span>
					{#if selectedTeamTypes.length > 0}
						<span
							class="ml-auto inline-flex items-center justify-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary"
						>
							{selectedTeamTypes.length}
						</span>
					{/if}
				</button>
				{#if teamTypeOpen}
					<div class="space-y-0.5 px-2 pb-2">
						{#each teamTypes as type (type)}
							<label
								class="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted"
							>
								<input
									type="checkbox"
									class="size-3.5 shrink-0 rounded border-input accent-primary"
									checked={isChecked(selectedTeamTypes, type)}
									onchange={() => toggleParam('team_type', type)}
								/>
								<span class="truncate text-xs">{type}</span>
							</label>
						{:else}
							<p class="px-1.5 py-2 text-xs text-muted-foreground">No team types available</p>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</SidebarGroupContent>
</SidebarGroup>
