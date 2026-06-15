<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Trophy, MapPin } from '@lucide/svelte';
	import type { Tournament, Competition } from '$lib/types';
	import { slugify } from '$lib/utils';

	type PageData = {
		tournaments: Tournament[];
		competitionMap: Map<number, Competition>;
	};

	let { data }: { data: PageData } = $props();

	// Sort tournaments reverse chronologically (latest first)
	let sortedTournaments = $derived(
		[...data.tournaments].sort((a, b) => b.start_date.localeCompare(a.start_date))
	);

	// Group tournaments by year-month (preserving descending order)
	let groupedTournaments = $derived.by(() => {
		const groupsMap: Record<string, Tournament[]> = {};
		for (const t of sortedTournaments) {
			const key = t.start_date.slice(0, 7); // yyyy-mm
			if (!groupsMap[key]) groupsMap[key] = [];
			groupsMap[key].push(t);
		}
		const groups: { key: string; label: string; tournaments: Tournament[] }[] = [];
		for (const [key, tournaments] of Object.entries(groupsMap)) {
			const date = new Date(key + '-01');
			const label = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
			groups.push({ key, label, tournaments });
		}
		return groups;
	});

	function formatDay(start: string, end: string): string {
		const startDate = new Date(start);
		const endDate = new Date(end);
		if (start === end) {
			return startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
		}
		return `${startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
	}

	function getDayNumber(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric' });
	}

	function getWeekday(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short' });
	}

	function tournamentHref(t: Tournament): string {
		return `/tournaments/${slugify(t.tournament_name)}--${t.id}`;
	}
</script>

<div class="mx-auto w-full max-w-3xl px-6 py-12">
	<div class="mb-8 flex items-center gap-3">
		<div
			class="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"
		>
			<Trophy class="size-5" />
		</div>
		<h1 class="text-2xl font-bold">Tournaments</h1>
	</div>

	<div class="relative">
		<!-- Vertical timeline line -->
		<div class="absolute top-0 bottom-0 left-[27px] w-px bg-border"></div>

		{#each groupedTournaments as group (group.key)}
			<!-- Month header -->
			<div class="relative mb-4 mt-8 first:mt-0">
				<div
					class="absolute left-[19px] top-1 size-4 rounded-full border-2 border-background bg-primary"
				></div>
				<div class="pl-16">
					<h2 class="text-lg font-semibold">{group.label}</h2>
					<span class="text-xs text-muted-foreground"
						>{group.tournaments.length}
						{group.tournaments.length === 1 ? 'tournament' : 'tournaments'}</span
					>
				</div>
			</div>

			<!-- Tournament events -->
			{#each group.tournaments as t (t.id)}
				<!-- eslint-disable-next-line -->
				<a href={tournamentHref(t)} class="relative mb-3 block">
					<!-- Date badge on the timeline -->
					<div class="absolute left-0 top-2 flex flex-col items-center" style="width: 56px;">
						<span class="text-lg font-bold leading-none">{getDayNumber(t.start_date)}</span>
						<span class="text-[10px] uppercase text-muted-foreground"
							>{getWeekday(t.start_date)}</span
						>
					</div>

					<!-- Tournament card -->
					<div class="pl-16">
						<Card class="transition-colors hover:bg-accent/50">
							<CardContent class="flex flex-col gap-2 py-3">
								<div class="flex items-start justify-between gap-2">
									<h3 class="font-medium leading-tight">{t.tournament_name}</h3>
									{#if t.competition && data.competitionMap.get(t.competition)}
										<Badge variant="secondary" class="shrink-0">
											{data.competitionMap.get(t.competition)!.name}
										</Badge>
									{/if}
								</div>
								<div
									class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
								>
									{#if t.start_date !== t.end_date}
										<span>{formatDay(t.start_date, t.end_date)}</span>
									{/if}
									{#if t.game && t.game.length > 0}
										<span class="flex items-center gap-1">
											<Trophy class="size-3" />
											{t.game.length}
											{t.game.length === 1 ? 'game' : 'games'}
										</span>
									{/if}
									{#if t.location?.name}
										<span class="flex items-center gap-1">
											<MapPin class="size-3" />
											{t.location.name}
										</span>
									{/if}
								</div>
							</CardContent>
						</Card>
					</div>
				</a>
			{/each}
		{/each}

		{#if sortedTournaments.length === 0}
			<div class="pl-16 py-8 text-sm text-muted-foreground">No tournaments scheduled.</div>
		{/if}
	</div>
</div>
