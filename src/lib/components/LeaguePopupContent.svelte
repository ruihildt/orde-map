<script lang="ts">
	import { MapPin, Mail, Users, ArrowRight, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import type { LeagueProperties, Team, LeagueContact, Organization } from '$lib/types';
	import { slugify } from '$lib/utils';

	let {
		league,
		teams = [],
		contacts = [],
		organizations = [],
		onClose
	}: {
		league: LeagueProperties;
		teams: Team[];
		contacts: LeagueContact[];
		organizations: Organization[];
		onClose?: () => void;
	} = $props();

	let orgMap = $derived(new Map(organizations.map((o) => [o.id, o.organization_name])));

	// Filter to this league's teams and contacts
	let leagueTeams = $derived(teams.filter((t) => t.team_league === league?.id));
	let leagueContacts = $derived(contacts.filter((c) => c.league === league?.id));

	function leagueHref(l: LeagueProperties): string {
		return `/leagues/${slugify(l.name)}--${l.id}`;
	}
</script>

<div class="relative w-80 space-y-4 p-5">
	<!-- Close button (shadcn-styled) -->
	{#if onClose}
		<button
			class="absolute top-4 right-4 flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={onClose}
			aria-label="Close"
		>
			<X class="size-4" />
		</button>
	{/if}

	<!-- Header -->
	<div class="space-y-1.5 pr-7">
		<h2 class="text-xl font-bold text-foreground leading-tight">{league.name}</h2>
		<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
			<MapPin class="size-4 shrink-0" />
			<span>
				{league.country ?? 'Unknown'}
				{#if league.address}
					– {league.address}
				{/if}
			</span>
		</div>
	</div>

	<!-- Contacts -->
	{#if leagueContacts.length > 0}
		<div class="space-y-2">
			<div class="flex items-center gap-1.5">
				<Mail class="size-4 text-muted-foreground" />
				<span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Contacts
				</span>
			</div>
			<div class="space-y-2">
				{#each leagueContacts as contact (contact.id)}
					<div class="rounded-md bg-muted/50 p-2.5 flex flex-col gap-1">
						<div class="text-sm font-medium">{contact.Type}</div>
						{#if contact.name}
							<div class="text-sm text-muted-foreground">{contact.name}</div>
						{/if}
						<a class="text-sm text-primary hover:underline break-all" href="mailto:{contact.email}">
							{contact.email}
						</a>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Teams -->
	{#if leagueTeams.length > 0}
		<div class="space-y-2">
			<div class="flex items-center gap-1.5">
				<Users class="size-4 text-muted-foreground" />
				<span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Teams
				</span>
			</div>
			<div class="space-y-2">
				{#each leagueTeams as team (team.id)}
					<div class="rounded-md bg-muted/50 p-2.5">
						<div class="text-sm font-medium">{team.team_name}</div>
						<div class="flex flex-wrap gap-1.5 items-center mt-1">
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
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- View details button -->
	<Button href={leagueHref(league)} size="sm" class="w-full">
		View details
		<ArrowRight class="size-3.5" />
	</Button>
</div>
