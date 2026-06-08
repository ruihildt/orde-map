import { env } from '$env/dynamic/public';
import type {
	League,
	Team,
	Organization,
	Game,
	LeagueContact,
	LeagueFeatureCollection
} from '$lib/types';

export async function load({ fetch }) {
	const apiUrl = env.PUBLIC_API_URL || 'https://backend.openrollerderby.eu';

	const [leaguesRes, teamsRes, contactsRes, orgsRes, gamesRes] = await Promise.all([
		fetch(`${apiUrl}/items/league`),
		fetch(`${apiUrl}/items/team?fields=*,affiliation.*`),
		fetch(`${apiUrl}/items/League_Contact`),
		fetch(`${apiUrl}/items/organization`),
		fetch(`${apiUrl}/items/game?sort=-date&limit=-1`)
	]);

	const { data: leagues }: { data: League[] } = await leaguesRes.json();
	const teamsData: Team[] = teamsRes.ok ? (await teamsRes.json()).data : [];
	const contactsData: LeagueContact[] = contactsRes.ok ? (await contactsRes.json()).data : [];
	const orgsData: Organization[] = orgsRes.ok ? (await orgsRes.json()).data : [];
	const gamesData: Game[] = gamesRes.ok ? (await gamesRes.json()).data : [];

	const geojson: LeagueFeatureCollection = {
		type: 'FeatureCollection',
		features: leagues
			.filter((league) => league.location !== null)
			.map((league) => ({
				type: 'Feature' as const,
				geometry: {
					type: 'Point' as const,
					coordinates: league.location!.coordinates
				},
				properties: {
					id: league.id,
					name: league.name,
					city: league.city,
					country: league.country,
					address: league.address
				}
			}))
	};

	return {
		geojson,
		teams: teamsData,
		contacts: contactsData,
		organizations: orgsData,
		games: gamesData
	};
}
