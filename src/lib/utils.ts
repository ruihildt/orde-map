import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LeagueFeatureCollection, Team } from '$lib/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface LeagueFilters {
	countries: string[];
	organizations: string[];
	teamTypes: string[];
}

export function hasActiveFilters(filters: LeagueFilters): boolean {
	return (
		filters.countries.length > 0 || filters.organizations.length > 0 || filters.teamTypes.length > 0
	);
}

// Precompute per-league organization ids from the teams data.
export function buildLeagueOrgMap(teams: Team[]): Record<string, string[]> {
	return teams.reduce<Record<string, string[]>>((acc, t) => {
		const arr = acc[t.team_league] ?? [];
		for (const aff of t.affiliation ?? []) {
			if (!arr.includes(aff.organization_id)) arr.push(aff.organization_id);
		}
		return { ...acc, [t.team_league]: arr };
	}, {});
}

// Precompute per-league team types from the teams data.
export function buildLeagueTeamTypeMap(teams: Team[]): Record<string, string[]> {
	return teams.reduce<Record<string, string[]>>((acc, t) => {
		if (!t.team_type) return acc;
		const arr = acc[t.team_league] ?? [];
		if (!arr.includes(t.team_type)) arr.push(t.team_type);
		return { ...acc, [t.team_league]: arr };
	}, {});
}

// Apply country/organization/team-type filters to a league feature collection.
// Returns a new filtered collection (shallow copy of the features array).
export function filterLeagues(
	geojson: LeagueFeatureCollection,
	teams: Team[],
	filters: LeagueFilters
): LeagueFeatureCollection {
	if (!hasActiveFilters(filters)) return geojson;
	const leagueOrgMap = buildLeagueOrgMap(teams);
	const leagueTeamTypeMap = buildLeagueTeamTypeMap(teams);
	const features = geojson.features.filter((f) => {
		const id = f.properties.id;
		if (filters.countries.length > 0 && !filters.countries.includes(f.properties.country ?? '')) {
			return false;
		}
		if (filters.organizations.length > 0) {
			const leagueOrgs = leagueOrgMap[id];
			if (!leagueOrgs || !leagueOrgs.some((o) => filters.organizations.includes(o))) return false;
		}
		if (filters.teamTypes.length > 0) {
			const leagueTypes = leagueTeamTypeMap[id];
			if (!leagueTypes || !leagueTypes.some((t) => filters.teamTypes.includes(t))) return false;
		}
		return true;
	});
	return { type: 'FeatureCollection', features };
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
