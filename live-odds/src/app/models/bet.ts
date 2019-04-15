export class Bet {
    constructor(
        public BetName: string,
        public BetNameAbbreviation: string,
        public BetTypeID: number,
        public BetCode: string,
        public GameID: number,
        public Bet_ISLIVE: boolean, 
        public BetForecastOdds: number,
        public BetForecastCode: number,
        public BetForecastDescription: string,
        public BetForecastStatus: number,
        public BetForecastDescriptionEnglish: string,
        public BetForecast_PARAM: number) {
    }
}
