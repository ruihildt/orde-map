import type { LeagueProperties, Team, Organization, Game, LeagueContact } from '$lib/types';
import { writable } from 'svelte/store';

export const selectedLeague = writable<LeagueProperties | null>(null);

export const leagueData = writable<{
	teams: Team[];
	contacts: LeagueContact[];
	organizations: Organization[];
	games: Game[];
} | null>(null);
