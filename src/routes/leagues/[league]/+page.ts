import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
import type { League, Team, Game, LeagueContact, Organization, Country } from '$lib/types';

export async function load({ params, fetch }) {
	const apiUrl = env.PUBLIC_API_URL || 'https://backend.openrollerderby.eu';

	// Extract ID from the "--id" suffix
	const slug = params.league;
	const doubleDashIndex = slug.lastIndexOf('--');
	const id = doubleDashIndex !== -1 ? slug.substring(doubleDashIndex + 2) : slug;

	// Fetch the league, teams, contacts, organizations, games, and countries
	const [leagueRes, teamsRes, contactsRes, orgsRes, gamesRes, countriesRes] = await Promise.all([
		fetch(
			`${apiUrl}/items/league/${id}?fields=id,name,country,location.id,location.name,location.address,location.location`
		),
		fetch(`${apiUrl}/items/team?fields=*,affiliation.*`),
		fetch(`${apiUrl}/items/League_Contact?filter[league][_eq]=${id}`),
		fetch(`${apiUrl}/items/organization`),
		fetch(`${apiUrl}/items/game?sort=-date&limit=-1`),
		fetch(`${apiUrl}/items/countries`)
	]);

	if (!leagueRes.ok) {
		throw error(404, 'League not found');
	}

	const league: League = (await leagueRes.json()).data;
	const allTeams: Team[] = teamsRes.ok ? (await teamsRes.json()).data : [];
	const contacts: LeagueContact[] = contactsRes.ok ? (await contactsRes.json()).data : [];
	const orgsData: Organization[] = orgsRes.ok ? (await orgsRes.json()).data : [];
	const gamesData: Game[] = gamesRes.ok ? (await gamesRes.json()).data : [];
	const countriesData: Country[] = countriesRes.ok ? (await countriesRes.json()).data : [];

	const countryMap = new Map<string, Country>(countriesData.map((c) => [c.id, c]));
	const countryName = league.country ? (countryMap.get(league.country)?.name ?? null) : null;

	// Filter teams to this league
	const leagueTeams = allTeams.filter((t) => t.team_league === id);

	// Build team name map from all teams (for game resolution)
	const teamMap = new Map<string, string>(allTeams.map((t) => [t.id, t.team_name]));
	const teamIds = new Set(leagueTeams.map((t) => t.id));

	// Filter games to those involving this league's teams
	const games = gamesData
		.filter((g) => teamIds.has(g.home_team) || teamIds.has(g.away_team))
		.map((g) => ({
			...g,
			home_team_name: teamMap.get(g.home_team) ?? g.home_team,
			away_team_name: teamMap.get(g.away_team) ?? g.away_team
		}));

	return {
		league,
		countryName,
		teams: leagueTeams,
		contacts,
		organizations: orgsData,
		games
	};
}
