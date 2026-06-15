<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Link, MapPin, Mail, Users, Calendar } from '@lucide/svelte';
	import type { League, Team, Game, LeagueContact, Organization } from '$lib/types';
	import { page } from '$app/state';

	type LeagueGame = Game & { home_team_name: string; away_team_name: string };

	type PageData = {
		league: League;
		countryName: string | null;
		teams: Team[];
		contacts: LeagueContact[];
		organizations: Organization[];
		games: LeagueGame[];
	};

	let { data }: { data: PageData } = $props();

	let copied = $state(false);

	function copyLink() {
		navigator.clipboard.writeText(page.url.href);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function formatGameDate(date: string, startTime: string | null): string {
		const d = new Date(date);
		const dateStr = d.toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		});
		if (startTime) {
			return `${dateStr} · ${startTime}`;
		}
		return dateStr;
	}

	let orgMap = $derived(new Map(data.organizations.map((o) => [o.id, o.organization_name])));

	// Group games by month (descending, like tournaments list)
	let groupedGames = $derived.by(() => {
		const groupsMap: Record<string, LeagueGame[]> = {};
		for (const g of data.games) {
			const key = g.date.slice(0, 7); // yyyy-mm
			if (!groupsMap[key]) groupsMap[key] = [];
			groupsMap[key].push(g);
		}
		const groups: { key: string; label: string; games: LeagueGame[] }[] = [];
		for (const [key, games] of Object.entries(groupsMap)) {
			const date = new Date(key + '-01');
			const label = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
			groups.push({ key, label, games });
		}
		return groups;
	});
</script>

<div class="mx-auto w-full max-w-3xl px-6 py-12">
	<div class="mb-10 flex items-center gap-3">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-bold">{data.league.name}</h1>
			<div class="flex flex-wrap items-center gap-2">
				{#if data.countryName}
					<Badge variant="secondary">{data.countryName}</Badge>
				{/if}
			</div>
		</div>
	</div>

	<!-- Info section -->
	<div class="mb-10 space-y-3 text-muted-foreground">
		{#if data.league.location}
			<div class="flex items-center gap-2">
				<MapPin class="size-4" />
				<span>
					{data.league.location.name}
					{#if data.league.location.address}
						– {data.league.location.address}
					{/if}
				</span>
				<!-- Mobile: copy link next to location -->
				<button
					class="flex items-center gap-1 ml-2 text-xs hover:text-foreground transition-colors md:hidden"
					onclick={copyLink}
				>
					{#if copied}
						Copied!
					{:else}
						<Link class="size-3" />
					{/if}
				</button>
			</div>
		{/if}
	</div>

	<!-- Contacts -->
	{#if data.contacts.length > 0}
		<div class="mb-10 space-y-3">
			<div class="flex items-center gap-1.5">
				<Mail class="size-4 text-muted-foreground" />
				<h2 class="text-lg font-semibold">Contacts</h2>
			</div>
			<div class="space-y-2">
				{#each data.contacts as contact (contact.id)}
					<div class="rounded-lg border bg-card p-4 flex flex-col gap-1">
						<div class="text-sm font-medium">{contact.Type}</div>
						{#if contact.name}
							<div class="text-xs text-muted-foreground">{contact.name}</div>
						{/if}
						<a class="text-xs text-primary hover:underline break-all" href="mailto:{contact.email}">
							{contact.email}
						</a>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Teams -->
	{#if data.teams.length > 0}
		<div class="mb-10 space-y-3">
			<div class="flex items-center gap-1.5">
				<Users class="size-4 text-muted-foreground" />
				<h2 class="text-lg font-semibold">Teams</h2>
			</div>
			<div class="space-y-2">
				{#each data.teams as team (team.id)}
					<div class="rounded-lg border bg-card p-4">
						<div class="flex flex-wrap gap-1.5 items-center">
							<span class="text-sm font-medium">{team.team_name}</span>
							{#if team.age_category}
								<Badge variant="secondary" class="text-[10px]">
									{team.age_category}
								</Badge>
							{/if}
							{#if team.team_type}
								<Badge variant="secondary" class="text-[10px]">
									{team.team_type}
								</Badge>
							{/if}
							{#if team.affiliation && team.affiliation.length > 0}
								{#each team.affiliation as aff (aff.id)}
									{#if orgMap.get(aff.organization_id)}
										<Badge variant="destructive" class="text-[10px]">
											{orgMap.get(aff.organization_id)}
										</Badge>
									{/if}
								{/each}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Results -->
	{#if data.games.length > 0}
		<div class="space-y-2">
			<div class="flex items-center gap-1.5">
				<Calendar class="size-4 text-muted-foreground" />
				<h2 class="text-lg font-semibold">Results</h2>
			</div>
			{#each groupedGames as group (group.key)}
				<div class="mb-4">
					<h3 class="mb-3 text-sm font-semibold text-muted-foreground">{group.label}</h3>
					{#each group.games as game (game.id)}
						<div class="flex w-full items-center gap-4 rounded-lg border bg-card p-4 mb-2">
							<!-- Date on the left -->
							<div class="w-24 shrink-0 text-xs text-muted-foreground">
								{formatGameDate(game.date, game.start_time)}
							</div>
							<!-- Teams and score centered -->
							<div class="flex flex-1 items-center justify-center gap-3 text-sm">
								<span class="flex-1 truncate text-right font-medium">{game.home_team_name}</span>
								<span class="flex shrink-0 items-center justify-center font-bold">
									<span class="w-8 text-right tabular-nums">{game.home_team_score}</span>
									<span class="px-1.5">-</span>
									<span class="w-8 text-left tabular-nums">{game.away_team_score}</span>
								</span>
								<span class="flex-1 truncate font-medium">{game.away_team_name}</span>
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">No results available for this league yet.</p>
	{/if}
</div>
