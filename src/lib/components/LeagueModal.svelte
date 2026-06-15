<script lang="ts">
	import { X, MapPin, Mail, Users } from '@lucide/svelte';
	import type { LeagueProperties, Team, LeagueContact, Organization } from '$lib/types';

	let {
		league = null,
		teams = [],
		contacts = [],
		organizations = [],
		onClose
	}: {
		league: LeagueProperties | null;
		teams: Team[];
		contacts: LeagueContact[];
		organizations: Organization[];
		onClose: () => void;
	} = $props();

	let orgMap = $derived(new Map(organizations.map((o) => [o.id, o.organization_name])));

	// Filter to this league's teams and contacts
	let leagueTeams = $derived(teams.filter((t) => t.team_league === league?.id));
	let leagueContacts = $derived(contacts.filter((c) => c.league === league?.id));

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if league}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
		onclick={onClose}
	>
		<!-- Modal -->
		<div
			class="bg-background rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto relative"
			role="dialog"
			aria-modal="true"
			aria-label={league.name}
			tabindex="-1"
		>
			<!-- Close button -->
			<button
				class="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
				onclick={onClose}
				aria-label="Close"
			>
				<X class="size-5" />
			</button>

			<!-- Header -->
			<div class="px-6 pt-6 pb-2">
				<h2 class="text-xl font-bold text-foreground pr-8">{league.name}</h2>
			</div>

			<!-- Content -->
			<div class="px-6 pb-6 space-y-5">
				<!-- Location -->
				<div class="flex flex-col gap-0.5">
					<div class="flex items-center gap-1.5">
						<MapPin class="size-4 text-muted-foreground" />
						<span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
							>Location</span
						>
					</div>
					<span class="text-sm text-foreground pl-5">
						{league.country ?? 'Unknown'}
						{#if league.address}
							– {league.address}
						{/if}
					</span>
				</div>

				<!-- Contacts -->
				{#if leagueContacts.length > 0}
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center gap-1.5">
							<Mail class="size-4 text-muted-foreground" />
							<span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
								>Contacts</span
							>
						</div>
						<div class="pl-5 space-y-2">
							{#each leagueContacts as contact (contact.id)}
								<div class="rounded-lg bg-muted/50 p-3 flex flex-col gap-1">
									<div class="text-sm font-medium">{contact.Type}</div>
									{#if contact.name}
										<div class="text-xs text-muted-foreground">{contact.name}</div>
									{/if}
									<a
										class="text-xs text-primary hover:underline break-all"
										href="mailto:{contact.email}"
									>
										{contact.email}
									</a>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Teams -->
				{#if leagueTeams.length > 0}
					<div class="flex flex-col gap-1.5">
						<div class="flex items-center gap-1.5">
							<Users class="size-4 text-muted-foreground" />
							<span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
								>Teams</span
							>
						</div>
						<div class="pl-5 space-y-2">
							{#each leagueTeams as team (team.id)}
								<div class="rounded-lg bg-muted/50 p-3">
									<div class="flex flex-wrap gap-1.5 items-center">
										<span class="text-sm font-medium">{team.team_name}</span>
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
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
