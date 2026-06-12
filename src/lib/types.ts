export interface Point {
	type: 'Point';
	coordinates: [number, number];
}

export interface Country {
	id: string;
	name: string;
	flag: string;
	three_letters_code: string;
	two_letters_code: string;
	continent: string;
}

export interface League {
	id: string;
	name: string;
	country: string | null;
	location: {
		id: number;
		name: string;
		address: string;
		location: Point;
	} | null;
}

export interface Feature<T> {
	type: 'Feature';
	geometry: Point;
	properties: T;
}

export interface LeagueProperties {
	id: string;
	name: string;
	country: string | null;
	address: string | null;
}

export type LeagueFeature = Feature<LeagueProperties>;

export interface Team {
	id: string;
	team_name: string;
	team_league: string;
	age_category: string | null;
	team_type: string | null;
	affiliation: {
		id: number;
		team_id: string;
		organization_id: string;
	}[];
}

export interface Organization {
	id: string;
	organization_name: string;
}

export interface Game {
	id: string;
	date: string;
	home_team_score: number;
	away_team_score: number;
	home_team: string;
	away_team: string;
}

export interface LeagueContact {
	id: number;
	league: string;
	Type: string;
	name: string | null;
	email: string;
}

export interface FeatureCollection<T> {
	type: 'FeatureCollection';
	features: Feature<T>[];
}

export type LeagueFeatureCollection = FeatureCollection<LeagueProperties>;
