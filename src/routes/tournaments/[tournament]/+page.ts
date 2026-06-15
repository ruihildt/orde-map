import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
import type { Tournament, Competition, Game, Team } from '$lib/types';

export async function load({ params, fetch }) {
	const apiUrl = env.PUBLIC_API_URL || 'https://backend.openrollerderby.eu';

	// Extract ID from the "--id" suffix
	const slug = params.tournament;
	const doubleDashIndex = slug.lastIndexOf('--');
	const id = doubleDashIndex !== -1 ? slug.substring(doubleDashIndex + 2) : slug;

	let tournamentRes: Response;
	let competitionsRes: Response;
	let teamsRes: Response;
	let gamesRes: Response;
	try {
		[tournamentRes, competitionsRes, teamsRes, gamesRes] = await Promise.all([
			fetch(`${apiUrl}/items/tournament/${id}?fields=*,location.*`),
			fetch(`${apiUrl}/items/competition`),
			fetch(`${apiUrl}/items/team?fields=id,team_name`),
			fetch(`${apiUrl}/items/game?filter[game_tournament][_eq]=${id}&sort=date&limit=-1`)
		]);
	} catch {
		error(
			503,
			'We could not reach the data server. The service may be down or your connection may have dropped. Please try again in a moment.'
		);
	}

	if (!tournamentRes.ok) {
		error(404, 'Tournament not found');
	}

	const tournament: Tournament = (await tournamentRes.json()).data;
	const competitionsData: Competition[] = competitionsRes.ok
		? (await competitionsRes.json()).data
		: [];
	const teamsData: Team[] = teamsRes.ok ? (await teamsRes.json()).data : [];
	const gamesData: Game[] = gamesRes.ok ? (await gamesRes.json()).data : [];

	const competitionMap = new Map<number, Competition>(competitionsData.map((c) => [c.id, c]));
	const teamMap = new Map<string, string>(teamsData.map((t) => [t.id, t.team_name]));

	const games = gamesData.map((g) => ({
		...g,
		home_team_name: teamMap.get(g.home_team) ?? g.home_team,
		away_team_name: teamMap.get(g.away_team) ?? g.away_team
	}));

	return {
		tournament,
		competitionMap,
		games
	};
}
