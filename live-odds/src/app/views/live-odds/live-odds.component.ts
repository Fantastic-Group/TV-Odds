import { Component, OnDestroy, OnInit, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { BetEventService } from 'src/app/services/bet-event.service';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { Bet } from '../../models/bet';
import { BetStyle, OddsDisplay, Orientation, SelectedGame, SelectedLeague, SelectedSport, Configuration } from '../../models/configuration';
import { Game, GameStatus } from '../../models/game';
import { Page, PageFactory } from '../../models/page';
import { Sport } from '../../models/sport';
import { GroupByPipe } from '../../pipes/groupby.pipe';
import { StartupService } from '../../services/startup.service';
import { PropBetColumn } from '../../models/prop-bet-column';
import { interval, Subscription } from 'rxjs';

@Component({
	selector: 'live-odds',
	templateUrl: './live-odds.component.html',
	styleUrls: ['./live-odds.component.scss'],
	providers: [GroupByPipe]
})
export class LiveOddsComponent implements OnInit, OnDestroy {
	@Input() previewDisplay: OddsDisplay;

	public oddsDisplay: OddsDisplay;
	public columns: Array<number>;
	public leaguePage: number = 1;
	public currentPage: number = 1;
	public totalPages: number = 1;
	public sportIndex: number = 0;
	public leagueIndex: number = 0;
	public sport: SelectedSport;
	public league: SelectedLeague;
	private displayNumber: number;
	private messageListener: void;
	private page: Page;
	private pagingSubscription: Subscription;

	constructor(
		public betEventService: BetEventService,
		public configurationService: ConfigurationService,
		public routerService: Router,
		private route: ActivatedRoute,
		private sportSettings: StartupService,
		private groupBy: GroupByPipe) {
		this.route.queryParams.subscribe(params => {
			this.displayNumber = params["screen"];
			this.loadConfiguration();
			this.listenForChanges();
		});
	}

	ngOnInit() {
		if (this.previewDisplay != null) {
			this.loadConfiguration();
			this.listenForChanges();
		}
	}

	ngOnDestroy(): void {
		this.messageListener = null;
	}

	/**
	 * Returns an array of SelectedGame objects that will be displayed for a given prop bet column
	 * @param league The league which contains the games to be shown
	 * @param column The UI column number the games will appear in
	 */
	public getPropBetsForColumn(league: SelectedLeague, column: number, futures:boolean): SelectedGame[] {
		var props = this.generatePropBetColumns(league, futures).find(p => p.columnNumber == column + ((this.leaguePage - 1) * this.page.columns));
		return props == null ? null : props.games;
	}

	/**
	 * Returns an array of game objects that will be shown for a given standard bet column
	 * @param sport The sport to determine how many pages will be shown
	 * @param league The league which contains the games to be shown
	 * @param column The UI column number the games will appear in
	 */
	public getGamesForColumn(sport: SelectedSport, league: SelectedLeague, column: number): Game[] {
		var overallColumn = column + ((this.leaguePage - 1) * this.page.columns); // The first column of page two is really the "fourth" column for data purposes
		return this.getGamesForOverallColumn(sport, league, overallColumn);
	}

	/**
	 * Returns true if the given league has standard bets
	 * @param league The league of games
	 */
	public hasStandard(league: SelectedLeague): boolean {
		return league != null && league.betStyle == BetStyle.Standard;
	}

	/**
	 * Returns true if the given league has prop bets
	 * @param league The league of games
	 */
	public hasProps(league: SelectedLeague): boolean {
		return league != null && league.betStyle == BetStyle.Props;
	}

	public getCasino(): string {
		return environment.casino;
	}

	protected isNonTeamSport(sport: Sport): boolean {
		return this.sportSettings.isNonTeamSport(sport.SportID);
	}

	/** Returns true if this display is a horizontal display. */
	protected isHorizontalDisplay(): boolean {
		return this.oddsDisplay.orientation == Orientation.Horizontal;
	}

	/**
	 * Returns all games that were selected for a specific league.
	 * @param league The league to get the associated games for.
	 */
	private getGames(league: SelectedLeague): Game[] {
		var games = league.selectedGames.map(g => g.game)
			.sort((a, b) => {

//				console.log(a.HomeTeamName, a.STATUS);

				if ((a.STATUS > 1 && b.STATUS > 1) || (a.STATUS <= 1 && b.STATUS <= 1)) {
					return a.HomeRotationNum - b.HomeRotationNum;
				}

				if (a.STATUS > 1) {
					return 1;
				} else {
					return -1;
				}



			});
		return games;
	}

	/** Updates the page being displayed to the next page. If on the final page, return to the first page. */
	private changePage(): void {
		if (this.currentPage == this.totalPages) {
			this.currentPage = 1;
			this.leaguePage = 1;
			this.sportIndex = 0;
			this.leagueIndex = 0;
		}
		else {
			this.currentPage++;
			this.setLeaguePage();
		}

		this.sport = this.oddsDisplay.sports[this.sportIndex];
		this.league = this.sport.leagues[this.leagueIndex];
	}

	/** Updates the page of the league currently being displayed to the next page. 
	 * If on the final page for the league, proceed to the next league for the current sport, or to the following sport if on the final league. 
	 * */
	private setLeaguePage() {
		var totalPagesForLeague = this.getTotalPagesForLeague(this.sport, this.league);
		if (totalPagesForLeague == this.leaguePage) {
			this.leaguePage = 1;
			if (this.leagueIndex == this.sport.leagues.length - 1) {
				this.leagueIndex = 0;
				if (this.sportIndex == this.oddsDisplay.sports.length - 1) {
					this.sportIndex = 0;
				}
				else {
					this.sportIndex++;
				}
			}
			else {
				this.leagueIndex++;
			}
		}
		else {
			this.leaguePage++;
		}
	}

	/** Loads the display settings from the configuration object in local storage and configures paging. If the display settings have been passed in via parameter, those values will be used instead. */
	private loadConfiguration(): void {
		if (this.previewDisplay != null) {
			this.oddsDisplay = this.configurationService.previewDisplay;
		} else {
			var config = this.configurationService.loadUpdateFromStorage();

			if (!config) {
				console.error("No configuration file found");
			} else {
				this.oddsDisplay = config.oddsDisplays.find(x => x.displayNumber == this.displayNumber);
			}
		}

		if (!this.oddsDisplay) {
			console.warn("Display settings not found");
		} else {
			this.configurePaging();
		}
	}

	/** Loads updated game values from storage. This will not be performed if in preview mode. */
	private loadUpdates(): void {
		if (this.previewDisplay == null) {
			var config = this.configurationService.loadUpdateFromStorage();
			if (!config) {
				console.error("No configuration file found");
			} else {
				this.oddsDisplay = config.oddsDisplays.find(x => x.displayNumber == this.displayNumber);

				if (!this.oddsDisplay) {
					console.warn("Display settings not found");
				}
			}
		}
	}

	/* Default all the paging variables and objects. */
	private configurePaging(): void {
		if (this.oddsDisplay != null && this.oddsDisplay.sports.length > 0) {
			this.page = PageFactory.getPage(this.oddsDisplay.orientation);
			this.columns = new Array(this.page.columns).fill(0).map((x, i) => i + 1);
			this.currentPage = 1;
			this.leaguePage = 1;
			this.totalPages = this.getTotalPages();
			this.sportIndex = 0;
			this.leagueIndex = 0;
			this.sport = this.oddsDisplay.sports[this.sportIndex];
			this.league = this.sport == null ? null : this.sport.leagues[this.leagueIndex];

			if (this.pagingSubscription != null)
				this.pagingSubscription.unsubscribe();

			// The page has an override for refreshing. Use this instead of the refresh requests from config page.
			if (this.oddsDisplay.refreshOverride > 0) {
				this.pagingSubscription = interval(this.oddsDisplay.refreshOverride * 1000)
					.subscribe(() => {
						this.changePage();
					});
			}
		}
	}

	/**
	 * Returns the amount of pages that will be generated for a given league.
	 * @param selectedSport The sport to determine how many pages will be shown
	 * @param selectedLeague The league to determine how many pages will be shown
	 */
	private getTotalPagesForLeague(selectedSport: SelectedSport, selectedLeague: SelectedLeague): number {
		var columns = 0;

		if (selectedLeague.betStyle == BetStyle.Standard) {
			var totalGames = this.getGames(selectedLeague).length;
			while (totalGames > 0) {
				columns++;
				var gamesPerColumn = this.getGamesForOverallColumn(selectedSport, selectedLeague, columns).length;
				totalGames -= gamesPerColumn;
			}
		} else {
			var propBetColumns = this.generatePropBetColumns(selectedLeague);
			columns = propBetColumns.length;
		}

		return Math.ceil(columns / this.page.columns);
	}

	/**
	 * Returns standard bet games to be shown in a given league and column.
	 * @param selectedSport The sport to determine how many pages will be shown
	 * @param league The league to return games from
	 * @param column Overall column for the league, not the column in the display. For example, 5 for the second column of page two.
	 */
	private getGamesForOverallColumn(selectedSport: SelectedSport, league: SelectedLeague, column: number): Game[] {
		var matches = this.getGames(league);
		if (league.betStyle == BetStyle.Standard) {
			var hasDraw = selectedSport.sport.SportName.toUpperCase() == "SOCCER";
			var startIndex = this.getStartIndexForColumn(hasDraw, matches, column);
			var totalGamesForColumn = this.getTotalGamesForColumn(hasDraw, matches, startIndex);
			return matches.splice(startIndex, totalGamesForColumn);
		}
	}

	/** Monitors changes to the data stored in storage and triggers events based on value changes. */
	private listenForChanges(): void {
		if (this.messageListener == null) {
			this.messageListener = window.addEventListener("storage", (ev) => {
				switch (ev.key) {
					case "refresh":
						this.refresh();
						break;
					case "config":
						this.loadConfiguration();
						break;
					case "updates":
						this.loadUpdates();
						break;
					case "reload":
						this.reload();
						break;
					default:
						console.warn("Unrecognized storage update!");
						break;
				}
			});
		}
	}

	/** Refreshes the page if a refresh override hasn't been specified for this page. */
    private refresh() {
		if (this.oddsDisplay != null && (this.oddsDisplay.refreshOverride == null || this.oddsDisplay.refreshOverride < 1)) {
			this.changePage();
        }
    }

	/** Forces the page to reload (similar to pressing ctrl-F5). Useful for pushing UI updates to the display. */
	private reload(): void {
		location.reload(true);
	}

	/**
	 * Returns the starting index of the game array for a given column
	 * @param hasDraw Boolean for if a "DRAW" row needs to be shown
	 * @param games Array of games to process
	 * @param column The overall column (ie. 5 for 2nd column, 2nd page) to find the starting position of.
	 */
	private getStartIndexForColumn(hasDraw: boolean, games: Game[], column: number): number {
		var startIndex = 0;

		for (var i = 1; i < column; i++) {
			startIndex += this.getTotalGamesForColumn(hasDraw, games, startIndex);
		}

		return startIndex;
	}

	/**
	 * Returns the total number of games that can be displayed for a given column. 
	 * For every additional date of data that can be shown we're removing a row from the max number of rows since they'll eat up screen real estate.
	 * @param hasDraw Boolean for if a "DRAW" row needs to be shown
	 * @param games Array of games to parse
	 * @param startIndex Starting position in games array for finding potential games
	 */
	private getTotalGamesForColumn(hasDraw: boolean, games: Game[], startIndex: number): number {
		var maxPerPage = hasDraw ? Math.floor(this.page.maxGamesPerPage * .67) : this.page.maxGamesPerPage;
		var maxGamesPerColumn = Math.floor(maxPerPage / this.page.columns);
		var potentialGames = games.slice(startIndex, startIndex + maxGamesPerColumn);
		var totalDates = this.groupBy.transform(potentialGames, "DisplayDate");

		return maxGamesPerColumn - (totalDates.length - 1);
	}

	/**
	 * Returns the total number of pages for this display. If there are multiple sports each league will appear on its own
	 * separate page even if there is room to fit both.
	 * (ie. in a 3 column horizontal layout, if MLB baseball takes 2 columns and NFL football takes 1 column, it'll be two pages)
	 * */
	private getTotalPages(): number {
		var totalPages = 0;

		this.oddsDisplay.sports.forEach(selectedSport => {
			selectedSport.leagues.forEach(selectedLeague => {
				totalPages += this.getTotalPagesForLeague(selectedSport, selectedLeague);
			});
		});

		return totalPages;
	}

	/**
	 * Returns an array of prop bet columns based on games and bets found in the league. Both bets and games can appear in multiple columns if the entirety of their
	 * information cannot fit in a single column.
	 * @param league A league to generate prop bet columns for.
	 */
	private generatePropBetColumns(league: SelectedLeague, futures?: boolean): Array<PropBetColumn> {
		var maxBetsForColumn = Math.floor((futures ? this.page.maxFuturesPerPage : this.page.maxPropsPerPage) / this.page.columns);

		

		var props = new Array<PropBetColumn>();
		var currentColumn = 1;
		var prop = new PropBetColumn(currentColumn);
		props.push(prop);



		league.selectedGames.forEach(game => {

			if (game.bets.length > 0) {
				if (league.futures) {
					game.bets = game.bets.filter(bet => bet.BetForecastOdds !== 0);
					game.bets.sort((a, b) =>
					{
						const betA = a.BetForecastDescriptionEnglish.toUpperCase();
						const betB = b.BetForecastDescriptionEnglish.toUpperCase();

						let comparison = 0;
						if (betA.indexOf('FIELD') > -1) {
							comparison = 1;
						}
						else if (a.BetForecastOdds > b.BetForecastOdds) {
							comparison = 1;
						} else if (a.BetForecastOdds < b.BetForecastOdds) {
							comparison = -1;
						}
						
						return comparison;
						});
				}

				var selectedGame = new SelectedGame(game.game);
				var availableBetCount = prop.games.length == 0 ? maxBetsForColumn : prop.availableBetsForColumn(maxBetsForColumn);
				if (availableBetCount > 0 && this.getPropBetsByIndex(game, 0, availableBetCount).length > 0) {
					prop.games.push(selectedGame);
				} else { // Not enough room to fit a prop bet from this game on the current column, starting a new column
					availableBetCount = maxBetsForColumn;
					currentColumn++;

					prop = new PropBetColumn(currentColumn);
					prop.games.push(selectedGame);
					props.push(prop);
				}

				if (game.bets.length < availableBetCount) {
					selectedGame.bets = game.bets;
				} else {
					// The bet will appear in multiple columns. Add whatever bets we can to this column, then add a new column with this game and bet in it.
					var betIndex = 0;

					while (betIndex < game.bets.length) {

						var betsForColumn = this.getPropBetsByIndex(game, betIndex, availableBetCount);
						selectedGame.bets = betsForColumn;
						betIndex += betsForColumn.length;

						// We've maxed out the bets for this column, create a new column and add this game to it to add additional bets from this game
						if (betIndex < game.bets.length) {
							availableBetCount = maxBetsForColumn;
							currentColumn++;

							prop = new PropBetColumn(currentColumn);
							selectedGame = new SelectedGame(game.game);
							prop.games.push(selectedGame);
							props.push(prop);
						}
					}
				}
			}
		});

		return props;
	}

	/**
	 * Returns a portion of the bet array for a game based on the starting index within the bets. To keep things from being confusing in the UI,
	 * if a game has only one bet remaining to be displayed in the next column, we're going to exclude it so we can show two in the following column.
	 * Likewise, if a game has three bets and we can't fit all three, we'll refrain from showing any of them in the current column. Otherwise, we'll return the whole set.
	 * @param game The game whose bets we are parsing
	 * @param start The starting index of the bets
	 * @param availableBetCount The maximum total amount of bets to return
	 */
	private getPropBetsByIndex(game: SelectedGame, start: number, availableBetCount: number): Array<Bet> {
		var retVal = Array<Bet>();
		var betChunk = game.bets.slice(start, start + availableBetCount);

		if (betChunk.length > 0) {

			var finalBetTypeID = betChunk[betChunk.length - 1].BetTypeID;
			var totalOfBetType = game.bets.filter(b => b.BetTypeID == finalBetTypeID).length;
			var chunkBetTypeTotal = betChunk.filter(b => b.BetTypeID == finalBetTypeID).length;
			var betTypeRemainder = totalOfBetType - chunkBetTypeTotal;

			if (totalOfBetType == 3 && betTypeRemainder > 0) {
				retVal = game.bets.slice(start, availableBetCount - chunkBetTypeTotal);
			} else if (betTypeRemainder == 1) {
				retVal = game.bets.slice(start, availableBetCount - 1);
			} else {
				retVal = betChunk;
			}
		}

		return retVal;
	}
}