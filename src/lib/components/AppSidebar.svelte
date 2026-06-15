<script lang="ts">
	import {
		Sidebar,
		SidebarContent,
		SidebarGroup,
		SidebarGroupContent,
		SidebarHeader,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem
	} from '$lib/components/ui/sidebar';
	import { MapPin, Info, ScrollText, Trophy } from '@lucide/svelte';
	import logo from '$lib/assets/skate.png';
	import { page } from '$app/state';
	import LeagueFilters from './LeagueFilters.svelte';
	import type { LeagueFeatureCollection, Team, Organization } from '$lib/types';

	let currentPath = $derived(page.url.pathname);

	// Filters are only relevant on the leagues map page (not league detail pages).
	let showLeagueFilters = $derived(currentPath === '/leagues/');

	// The /leagues/ load function returns geojson/teams/organizations.
	// We read them defensively from the merged page data so the sidebar
	// doesn't crash on routes that don't provide them.
	let leagueData = $derived(
		showLeagueFilters
			? (page.data as {
					geojson?: LeagueFeatureCollection;
					teams?: Team[];
					organizations?: Organization[];
				})
			: null
	);
	let canShowFilters = $derived(
		!!leagueData?.geojson && !!leagueData.teams && !!leagueData.organizations
	);

	const navMenuItems = [
		{ label: 'Leagues', icon: MapPin, href: '/leagues/' },
		{ label: 'Tournaments', icon: Trophy, href: '/tournaments/' }
	];

	const secondaryMenuItems = [
		{ label: 'About', icon: Info, href: '/about/' },
		{ label: 'License', icon: ScrollText, href: '/license/' }
	];
</script>

<Sidebar collapsible="icon">
	<SidebarHeader>
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" tooltipContent="Open Roller Derby Europe">
					<img src={logo} alt="ORDE" class="size-8 rounded-lg" />
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">Open Roller Derby Europe</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarHeader>

	<SidebarContent class="overflow-x-hidden">
		<!-- Main Navigation -->
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{#each navMenuItems as item (item.label)}
						<SidebarMenuItem>
							<!-- eslint-disable-next-line -->
							<a href={item.href} class="block cursor-pointer">
								<SidebarMenuButton
									tooltipContent={item.label}
									size="lg"
									isActive={currentPath === item.href}
								>
									<item.icon class="size-5" />
									<span class="text-base">{item.label}</span>
								</SidebarMenuButton>
							</a>
						</SidebarMenuItem>
					{/each}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>

		<!-- Filters (only on leagues map page) -->
		{#if canShowFilters && leagueData?.geojson && leagueData.teams && leagueData.organizations}
			<div class="flex-1 overflow-y-auto">
				<LeagueFilters
					geojson={leagueData.geojson}
					teams={leagueData.teams}
					organizations={leagueData.organizations}
				/>
			</div>
		{/if}

		<!-- Spacer to push secondary items to bottom -->
		{#if !canShowFilters}
			<div class="flex-1"></div>
		{/if}

		<!-- Secondary Menu -->
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{#each secondaryMenuItems as item (item.label)}
						<SidebarMenuItem>
							<!-- eslint-disable-next-line -->
							<a href={item.href} class="block cursor-pointer">
								<SidebarMenuButton
									tooltipContent={item.label}
									size="lg"
									isActive={currentPath === item.href}
								>
									<item.icon class="size-5" />
									<span class="text-base">{item.label}</span>
								</SidebarMenuButton>
							</a>
						</SidebarMenuItem>
					{/each}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	</SidebarContent>
</Sidebar>
