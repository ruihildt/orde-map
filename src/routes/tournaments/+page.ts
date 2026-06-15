import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
import type { Tournament, Competition, Game, Team, League, Country } from '$lib/types';

export async function load({ fetch }) {
	const apiUrl = env.PUBLIC_API_URL || 'https://backend.openrollerderby.eu';

	let tournamentsRes: Response;
	let competitionsRes: Response;
	let gamesRes: Response;
	let teamsRes: Response;
	let leaguesRes: Response;
	let countriesRes: Response;
	try {
		[tournamentsRes, competitionsRes, gamesRes, teamsRes, leaguesRes, countriesRes] =
			await Promise.all([
				fetch(`${apiUrl}/items/tournament?sort=-start_date&fields=*,competition.*`),
				fetch(`${apiUrl}/items/competition`),
				fetch(`${apiUrl}/items/game?limit=-1`),
				fetch(`${apiUrl}/items/team?fields=id,team_league`),
				fetch(`${apiUrl}/items/league?fields=id,country`),
				fetch(`${apiUrl}/items/countries`)
			]);
	} catch {
		error(
			503,
			'We could not reach the data server. The service may be down or your connection may have dropped. Please try again in a moment.'
		);
	}

	const tournamentsData: Tournament[] = tournamentsRes.ok ? (await tournamentsRes.json()).data : [];
	const competitionsData: Competition[] = competitionsRes.ok
		? (await competitionsRes.json()).data
		: [];
	const gamesData: Game[] = gamesRes.ok ? (await gamesRes.json()).data : [];
	const teamsData: Team[] = teamsRes.ok ? (await teamsRes.json()).data : [];
	const leaguesData: League[] = leaguesRes.ok ? (await leaguesRes.json()).data : [];
	const countriesData: Country[] = countriesRes.ok ? (await countriesRes.json()).data : [];

	const competitionMap = new Map<number, Competition>(competitionsData.map((c) => [c.id, c]));

	// Build lookup chain: country → continent, league → isEuropean, team → isEuropean
	const countryMap = new Map<string, Country>(countriesData.map((c) => [c.id, c]));
	const leagueIsEuropean = new Map<string, boolean>(
		leaguesData.map((l) => [
			l.id,
			l.country ? countryMap.get(l.country)?.continent === 'eu' : false
		])
	);
	const teamIsEuropean = new Map<string, boolean>(
		teamsData.map((t) => [
			t.id,
			t.team_league ? (leagueIsEuropean.get(t.team_league) ?? false) : false
		])
	);

	// A game is European if at least one team is European
	const gameIsEuropean = new Map<string, boolean>(
		gamesData.map((g) => [
			g.id,
			(teamIsEuropean.get(g.home_team) ?? false) || (teamIsEuropean.get(g.away_team) ?? false)
		])
	);

	// Only show tournaments that happen in Europe (at least one European game)
	const europeanTournaments = tournamentsData.filter((t) =>
		t.game.some((gameId) => gameIsEuropean.get(gameId) ?? false)
	);

	return {
		tournaments: europeanTournaments,
		competitionMap
	};
}
