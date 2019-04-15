import { League } from "./league";
import { Game } from "./game";
import { Bet } from "./bet";
import { Sport } from "./sport";

export class Configuration {
	public lastModified: Date;

	constructor(
		public totalDisplays: number,
		public refresh: number,
		public oddsDisplays: Array<OddsDisplay>) { }
}

export class OddsDisplay {
	public sports: SelectedSport[];
	public HDDisplay: boolean;
	public refreshOverride: number;

	constructor(
		public displayNumber: number,
		public orientation: Orientation
		) {
		this.HDDisplay = false;
		this.sports = [];
	}
}

export const typeOfDisplay = ['Pre-Game', 'In Play'];

export enum Orientation { 'Horizontal', 'Vertical' };

export enum BetStyle {
	Standard = 1,
	Props = 2
}

export class SelectedSport {
	public leagues: SelectedLeague[];

	constructor(public sport: Sport) {
		this.leagues = [];
	}
}

export class SelectedLeague {
	public selectAllGames: boolean;
	public selectedGames: SelectedGame[];
	public overUnderShowJuice: boolean;
	public spreadShowJuice: boolean;
	public futures: boolean;
	
	constructor(public league: League, public header: string, public subHeader: string, public betStyle: BetStyle) {
		this.selectedGames = [];
		this.overUnderShowJuice = false;
		this.spreadShowJuice = false;
		this.futures = false;
	}
}

export class SelectedGame {
	
	public bets: Bet[];

	constructor(public game: Game) {
		
		this.bets = [];
	}
}

