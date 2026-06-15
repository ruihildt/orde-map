import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';
import type {
	League,
	Team,
	Organization,
	Game,
	LeagueContact,
	LeagueFeatureCollection,
	Country
} from '$lib/types';

export async function load({ fetch }) {
	const apiUrl = env.PUBLIC_API_URL || 'https://backend.openrollerderby.eu';

	let leaguesRes: Response;
	let teamsRes: Response;
	let contactsRes: Response;
	let orgsRes: Response;
	let gamesRes: Response;
	let countriesRes: Response;
	try {
		[leaguesRes, teamsRes, contactsRes, orgsRes, gamesRes, countriesRes] = await Promise.all([
			fetch(
				`${apiUrl}/items/league?fields=id,name,country,location.id,location.name,location.address,location.location`
			),
			fetch(`${apiUrl}/items/team?fields=*,affiliation.*`),
			fetch(`${apiUrl}/items/League_Contact`),
			fetch(`${apiUrl}/items/organization`),
			fetch(`${apiUrl}/items/game?sort=-date&limit=-1`),
			fetch(`${apiUrl}/items/countries`)
		]);
	} catch {
		error(
			503,
			'We could not reach the data server. The service may be down or your connection may have dropped. Please try again in a moment.'
		);
	}

	const leagues: League[] = leaguesRes.ok ? (await leaguesRes.json()).data : [];
	const teamsData: Team[] = teamsRes.ok ? (await teamsRes.json()).data : [];
	const contactsData: LeagueContact[] = contactsRes.ok ? (await contactsRes.json()).data : [];
	const orgsData: Organization[] = orgsRes.ok ? (await orgsRes.json()).data : [];
	const gamesData: Game[] = gamesRes.ok ? (await gamesRes.json()).data : [];
	const countriesData: Country[] = countriesRes.ok ? (await countriesRes.json()).data : [];

	const countryMap = new Map<string, Country>(countriesData.map((c) => [c.id, c]));

	const geojson: LeagueFeatureCollection = {
		type: 'FeatureCollection',
		features: leagues
			.filter((league) => {
				if (league.location === null) return false;
				if (!league.country) return false;
				const country = countryMap.get(league.country);
				return country?.continent === 'eu';
			})
			.map((league) => ({
				type: 'Feature' as const,
				geometry: {
					type: 'Point' as const,
					coordinates: league.location!.location.coordinates
				},
				properties: {
					id: league.id,
					name: league.name,
					country: countryMap.get(league.country!)?.name ?? null,
					address: league.location!.address
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
