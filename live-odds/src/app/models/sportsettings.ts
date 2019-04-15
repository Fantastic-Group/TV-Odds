export class SportSettings {
	
	public constructor(
		public NonTeamSports: Array<number>,
		public Bets: Array<SportBet>,
		public StandardBetNames: Array<BetName>,
		public Casino: string,
		public Statuses: Array<GameStatus>
		) {
	}
}

export class SportBet {
	public constructor(
		public SportId: number,
		public HideJuice: boolean,
		public BetTypes: Array<BetTypeId>
	) { }
}

export class BetName {
	public constructor(public BetName: string, public BetType: BetType) {}
}

export class GameStatus {
	public constructor(
		public ID: number,
		public Display: string,
		public Ignore: boolean) { }
}

/* All football and basketball should be Spread, Over/Under and then Money Line. In all baseball and hockey, it is Money Line, Over/Under and run line for baseball and goal line for hockey. */

export class BetTypeId {
	public constructor(
		public BetType: string,
		public ID: number,
		public Display: string
	) { }
}

export enum BetType {
	Spread = 1,
	MoneyLine = 2,
	OverUnder = 4
}