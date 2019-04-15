export class Score {
	constructor(
		public GameID: number,
		//public BRLIVESTR: string,
		public BRSCORECURA: number,
		public BRSCORECURH: number,
		public BRSTATUS: number
	) {
		this.sanitizeData();
	}

	/** EnterGaming sends null values as a string "null". This updates the values to actual nulls */
	private sanitizeData(): void {
		//if (this.BRLIVESTR == "null")
		//	this.BRLIVESTR = null;
	}
}