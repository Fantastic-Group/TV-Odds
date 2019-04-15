import { SelectedGame } from "./configuration";
import { groupBy, mergeMap, toArray } from "rxjs/operators";
import { from } from "rxjs";
import { Bet } from "./bet";
import { GroupByPipe } from "../pipes/groupby.pipe";

export class PropBetColumn {
	public games: SelectedGame[];
	public groupBy: GroupByPipe;

	constructor(
		public columnNumber: number
	) {
		this.games = [];
		this.groupBy = new GroupByPipe();
	}

	public totalBets(): number {
		return this.games.map(g => g.bets.length).reduce((total, number) => total + number, 0);
	}

	public availableBetsForColumn(defaultMaxBets: number): number {
		return defaultMaxBets - (this.games.length + 1) - this.totalBets() - this.getTotalBetTypes();
	}

	private getTotalBetTypes() : number {
		var totalBetTypes = 1;
		this.games.forEach(g => {
			var groupedBetTypes = this.groupBy.transform(g.bets, "BetTypeID");
			totalBetTypes += groupedBetTypes == null ? 0 : groupedBetTypes.length;
		});

		return totalBetTypes;
	}
}