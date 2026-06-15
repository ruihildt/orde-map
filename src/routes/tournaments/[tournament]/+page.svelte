<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Link, MapPin, Calendar } from '@lucide/svelte';
	import type { Tournament, Competition, Game } from '$lib/types';
	import { page } from '$app/state';

	type TournamentGame = Game & { home_team_name: string; away_team_name: string };

	type PageData = {
		tournament: Tournament;
		competitionMap: Map<number, Competition>;
		games: TournamentGame[];
	};

	let { data }: { data: PageData } = $props();

	let copied = $state(false);

	function copyLink() {
		navigator.clipboard.writeText(page.url.href);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
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

	let competitionName = $derived(
		data.tournament.competition ? data.competitionMap.get(data.tournament.competition)?.name : null
	);
</script>

<div class="mx-auto w-full max-w-3xl px-6 py-12">
	<div class="mb-10 flex items-center gap-3">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-bold">{data.tournament.tournament_name}</h1>
			<div class="flex flex-wrap items-center gap-2">
				{#if competitionName}
					<Badge variant="secondary">{competitionName}</Badge>
				{/if}
			</div>
		</div>
	</div>

	<!-- Info section -->
	<div class="mb-10 space-y-3 text-muted-foreground">
		<div class="flex items-center gap-2">
			<Calendar class="size-4" />
			<span>
				{formatDate(data.tournament.start_date)}
				{#if data.tournament.start_date !== data.tournament.end_date}
					– {formatDate(data.tournament.end_date)}
				{/if}
			</span>
			<!-- Mobile: copy link next to date -->
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
		{#if data.tournament.location}
			<div class="flex items-center gap-2">
				<MapPin class="size-4" />
				<span>
					{data.tournament.location.name}
					{#if data.tournament.location.address}
						– {data.tournament.location.address}
					{/if}
				</span>
			</div>
		{/if}
	</div>

	<!-- Results -->
	{#if data.games.length > 0}
		<div class="space-y-2">
			<h2 class="mb-4 text-lg font-semibold">Results</h2>
			{#each data.games as game (game.id)}
				<div class="flex w-full items-center gap-4 rounded-lg border bg-card p-4">
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
	{:else}
		<p class="text-sm text-muted-foreground">No results available for this tournament yet.</p>
	{/if}
</div>
