export class Game {
	public HomeTeamScore: number;
	public AwayTeamScore: number;
	public BRStatus: number;

	constructor(
        public ActualDate: Date, 
        //public BetStartDate: Date, 
        public ScheduledDate: Date, 
        public DisplayDate: Date, 
       // public LiveDate: Date, 
        public Antepost: boolean, 
        public STATUS: GameStatus,
        public LeagueID: number,
        public SportID: number,
        public GameID: number,
        public HomeTeamID: number,
        public HomeTeamName: string, // "null" sometimes passed instead of null
        public HomeTeamAlias: string, // "null" sometimes passed instead of null
        public AwayTeamID: number,
        public AwayTeamName: string, // "null" sometimes passed instead of null
		public AwayTeamAlias: string,
		public HomeRotationNum: number,
		public AwayRotationNum: number,
		public Comment: string,
		public Switch: boolean) { // "null" sometimes passed instead of null
		
    }
}

export enum GameStatus {
	Inactive = 0,
	ActiveForBetting = 1,
	Blocked = 2,
	Canceled = 3,
	Started = 6,
	ProcessingResults = 7,
	Finished = 8
}