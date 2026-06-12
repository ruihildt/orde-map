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
	import { ArrowLeft, MapPin, Info, ScrollText, Link } from '@lucide/svelte';
	import logo from '$lib/assets/skate.png';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { SvelteSet } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { selectedLeague, leagueData } from '$lib/stores';

	let currentPath = $derived(page.url.pathname);

	const sidebar = useSidebar();

	let copied = $state(false);

	function copyLink() {
		navigator.clipboard.writeText(page.url.href);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	// Auto-open sidebar on mobile when a league is selected
	$effect(() => {
		if ($selectedLeague && sidebar.isMobile) {
			sidebar.openMobile = true;
		}
	});

	function handleBack() {
		$selectedLeague = null;
		if (sidebar.isMobile) {
			sidebar.openMobile = false;
		}
		// eslint-disable-next-line
		goto('/leagues/', { replaceState: true });
	}

	let showAllGames = new SvelteSet<string>();

	let teams = $derived($leagueData?.teams ?? []);
	let contacts = $derived($leagueData?.contacts ?? []);
	let organizations = $derived($leagueData?.organizations ?? []);
	let games = $derived($leagueData?.games ?? []);

	let leagueTeams = $derived(teams.filter((t) => t.team_league === $selectedLeague?.id));
	let leagueContacts = $derived(contacts.filter((c) => c.league === $selectedLeague?.id));
	let orgMap = $derived(new Map(organizations.map((o) => [o.id, o.organization_name])));
	let teamNameMap = $derived(new Map(teams.map((t) => [t.id, t.team_name])));
	let leagueTeamIds = $derived(new Set(leagueTeams.map((t) => t.id)));
	let leagueGames = $derived(
		games
			.filter((g) => leagueTeamIds.has(g.home_team) || leagueTeamIds.has(g.away_team))
			.sort((a, b) => b.date.localeCompare(a.date))
	);
	let gamesByTeam = $derived(
		leagueTeams.map((team) => ({
			team,
			games: leagueGames.filter((g) => g.home_team === team.id || g.away_team === team.id)
		}))
	);

	const navMenuItems = [{ label: 'Leagues', icon: MapPin, href: '/leagues/' }];

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
		{#if $selectedLeague}
			<button
				class="flex w-full items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
				onclick={handleBack}
			>
				<ArrowLeft class="size-4" />
				<span>Show all leagues</span>
			</button>
		{/if}
	</SidebarHeader>

	<SidebarContent class="overflow-x-hidden">
		{#if $selectedLeague}
			{#if sidebar.isMobile}
				<SidebarGroup class="py-0">
					<SidebarGroupContent>
						<div class="px-3 pt-2 pb-1">
							<div class="text-sm font-semibold text-foreground truncate">
								{$selectedLeague.name}
							</div>
						</div>
						<button
							class="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
							onclick={copyLink}
						>
							{#if copied}
								Copied!
							{:else}
								<Link class="size-3.5" />
								Copy link
							{/if}
						</button>
					</SidebarGroupContent>
				</SidebarGroup>
			{/if}

			<SidebarGroup class="pt-0">
				<SidebarGroupContent>
					<div class="space-y-3 px-2 group-data-[collapsible=icon]:hidden">
						{#if $selectedLeague.country}
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
									>Location</span
								>
								<span class="text-sm text-foreground">{$selectedLeague.country}</span>
							</div>
						{/if}
						{#if leagueContacts.length > 0}
							<div class="flex flex-col gap-1.5">
								<span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
									>Contacts</span
								>
								<div class="space-y-2">
									{#each leagueContacts as contact (contact.id)}
										<div class="rounded-lg bg-muted/50 p-2.5 flex flex-col gap-1">
											<div class="text-sm font-medium">{contact.Type}</div>
											{#if contact.name}
												<div class="text-xs text-muted-foreground">{contact.name}</div>
											{/if}
											<a
												class="text-xs text-primary hover:underline break-all"
												href="mailto:{contact.email}">{contact.email}</a
											>
										</div>
									{/each}
								</div>
							</div>
						{/if}
						{#if gamesByTeam.length > 0}
							<div class="flex flex-col gap-1.5">
								<span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
									>Results</span
								>
								{#each gamesByTeam as { team, games } (team.id)}
									<div>
										<div class="flex gap-1.5 mb-2 flex-wrap">
											<span class="text-xs font-semibold text-foreground">
												{team.team_name}
											</span>
											{#if team.age_category}
												<span
													class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
												>
													{team.age_category}
												</span>
											{/if}
											{#if team.team_type}
												<span
													class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
												>
													{team.team_type}
												</span>
											{/if}
											{#if team.affiliation && team.affiliation.length > 0}
												{#each team.affiliation as aff (aff.id)}
													{#if orgMap.get(aff.organization_id)}
														<span
															class="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive"
														>
															{orgMap.get(aff.organization_id)}
														</span>
													{/if}
												{/each}
											{/if}
										</div>
										{#if games.length > 0}
											<div class="space-y-2">
												{#each showAllGames.has(team.id) ? games : games.slice(0, 5) as game (game.id)}
													<div class="rounded-lg bg-muted/50 p-2.5 flex flex-col gap-1.5">
														<div
															class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
														>
															{new Date(game.date).toLocaleDateString('en-GB', {
																day: 'numeric',
																month: 'short',
																year: 'numeric'
															})}
														</div>
														<div class="flex items-center gap-2 text-xs">
															<span
																class="flex-1 {game.home_team_score > game.away_team_score
																	? 'font-bold text-foreground'
																	: 'text-muted-foreground'}"
															>
																{teamNameMap.get(game.home_team) ?? 'Unknown'}
															</span>
															<span class="font-bold text-foreground whitespace-nowrap">
																{game.home_team_score} - {game.away_team_score}
															</span>
															<span
																class="flex-1 text-right {game.away_team_score >
																game.home_team_score
																	? 'font-bold text-foreground'
																	: 'text-muted-foreground'}"
															>
																{teamNameMap.get(game.away_team) ?? 'Unknown'}
															</span>
														</div>
													</div>
												{/each}
												{#if games.length > 5}
													<button
														class="w-full rounded-md border border-primary/30 text-primary py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
														onclick={() => {
															if (showAllGames.has(team.id)) {
																showAllGames.delete(team.id);
															} else {
																showAllGames.add(team.id);
															}
														}}
													>
														{showAllGames.has(team.id)
															? 'Show less'
															: `Show all ${games.length} games`}
													</button>
												{/if}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</SidebarGroupContent>
			</SidebarGroup>
		{:else}
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

			<!-- Spacer to push secondary items to bottom -->
			<div class="flex-1"></div>

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
		{/if}
	</SidebarContent>
</Sidebar>
