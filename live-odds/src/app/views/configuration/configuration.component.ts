import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { Configuration, Orientation, OddsDisplay, SelectedSport, SelectedLeague, SelectedGame, BetStyle } from 'src/app/models/configuration';
import { ConfigurationService } from '../../services/configuration.service';
import { Router } from '@angular/router';
import { BetEventService } from 'src/app/services/bet-event.service';
import { interval, Subscription } from 'rxjs';
import { Sport } from '../../models/sport';
import { Game } from '../../models/game';
import { League } from '../../models/league';
import { Bet } from '../../models/bet';
import { StartupService } from '../../services/startup.service';
import { LiveUpdateService } from '../../services/live-update.service';
import { GroupByPipe } from '../../pipes/groupby.pipe';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
	selector: 'app-configuration',
	templateUrl: './configuration.component.html',
	styleUrls: ['./configuration.component.scss'],
	providers: [GroupByPipe]
})
export class ConfigurationComponent implements OnInit, OnDestroy {
	model: Configuration;
	orientation: any = Orientation;
	orientations(): Array<string> {
		var keys = Object.keys(Orientation);
		return keys.slice(keys.length / 2);
	}
	displaySubscription: Subscription;
	dataSubscription: Subscription;
	sports: Array<Sport>;
	leagues: { [sportID: number]: League[] } = {};
	games: { [leagueID: number]: Game[] } = {};
	bets: { [leagueID: number]: Bet[] } = {};
	betList: { [leagueID: number]: Bet[] } = {};
	selectedBetList: { [leagueID: number]: Bet[] } = {};
	currentDisplayIndex: number;
	futures: { [leagueID: number]: Bet[] } = {};
	HDDisplay: boolean;
	showPreview: boolean;
	configForm: FormGroup;

	constructor(
		public router: Router,
		public configurationService: ConfigurationService,
		public betEventService: BetEventService,
		private sportSettings: StartupService,
		private liveUpdateService: LiveUpdateService,
		private groupByPipe: GroupByPipe) {
		this.currentDisplayIndex = 0;
	}

	ngOnInit() {
		this.showPreview = false;
		this.model = this.configurationService.loadConfigurationFromStorage();

		if (this.model == null) {
			this.model = new Configuration(8, 30, new Array<OddsDisplay>());

			for (var i = 0; i < this.model.totalDisplays; i++) {
				this.model.oddsDisplays.push(new OddsDisplay(i + 1, Orientation.Vertical));
			}
		}

		// Only display sports listed in sportssettings.json file
		this.betEventService.getSports().subscribe(result => {
			this.sports = result.filter(x => this.sportSettings.getSport(x) != null);
			this.getDataForSavedModel();
		});

		this.createValidators();
		this.enableDisplayMessaging();
		this.startWebSocketMessaging(this.model);
		this.subscribeToDataUpdates();
	}

	ngOnDestroy(): void {
		this.displaySubscription.unsubscribe();
		this.dataSubscription.unsubscribe();
	}

	previousOddsDisplay(el: Element) {
		if (this.configForm.valid) {
			if (this.currentDisplayIndex != 0)
				this.currentDisplayIndex--;

			this.scroll(el);
			this.setRefreshValidator();
		} else {
			alert("Please correct errors before proceeding.");
		}
	}

	nextOddsDisplay(el: Element) {
		if (this.configForm.valid) {
			if (this.currentDisplayIndex < this.model.oddsDisplays.length - 1)
				this.currentDisplayIndex++;

			this.scroll(el);
			this.setRefreshValidator();
		} else {
			alert("Please correct errors before proceeding.");
		}
	}
	/**
	 * Toggles the override refresh input and validator.
	 * @param oddsDisplay The odds display to toggle the override refresh option for.
	 */
	public overrideRefresh(oddsDisplay: OddsDisplay) {
		oddsDisplay.refreshOverride = null;
		var validator = this.configForm.get("refreshOverride");
		if (validator.enabled)
			validator.disable();
		else
			validator.enable();

		validator.markAsUntouched();
	}

	scroll(el: Element) {
		el.scrollIntoView();
	}

	/** Generates a preview of the current display and shows it to the user */
	public preview() {
		this.showPreview = true;
		this.configurationService.updatePreviewDisplay(this.model.oddsDisplays[this.currentDisplayIndex], this.model.refresh);
	}

	/**
	 * Returns true if the juice should be disabled for this section
	 * @param oddsDisplay The display
	 * @param sport The current selected sport
	 * @param league The current selected league
	 */
	public disableJuice(oddsDisplay: OddsDisplay, sport: Sport, league: League): boolean {
		return oddsDisplay.orientation == Orientation.Horizontal || this.getSelectedLeague(oddsDisplay, sport, league).betStyle == BetStyle.Props;
	}

	resetSelections(num?): void {
		if (num && num > 0) {
			this.model.oddsDisplays[num].sports = new Array<SelectedSport>();
		} else {
			this.model.oddsDisplays.forEach(o => {
				o.sports = new Array<SelectedSport>();
			});
		}
	}
	getCasino(): string {
		return this.sportSettings.getCasino();
	}


	getSelectedLeague(oddsDisplay: OddsDisplay, sport: Sport, league: League): SelectedLeague {
		return oddsDisplay.sports.find(s => s.sport.SportID == sport.SportID).leagues.find(l => l.league.LeagueID == league.LeagueID);
	}

	getSelectedGame(oddsDisplay: OddsDisplay, sport: Sport, league: League, game: Game): SelectedGame {
		var selectedLeague = this.getSelectedLeague(oddsDisplay, sport, league);
		var gameIndex = selectedLeague.selectedGames.map(a => a.game).findIndex(g => g.GameID == game.GameID);
		var selectedGame = null;
		if (gameIndex > -1) {
			selectedGame = selectedLeague.selectedGames[gameIndex];
		}
		return selectedGame;
	}

	hasDefaultStandardBets(sport: Sport): boolean {
		return this.sportSettings.hasDefaultStandardBets(sport);
	}

	hasSelectedGamesForLeague(oddsDisplay: OddsDisplay, sport: Sport, league: League): boolean {
		var selectedLeague = this.getSelectedLeague(oddsDisplay, sport, league);
		return selectedLeague.selectedGames.length > 0;
	}

	loadBetList(oddsDisplay: OddsDisplay, sport: Sport, league: League): void {
		var selectedLeague = this.getSelectedLeague(oddsDisplay, sport, league);
		if (selectedLeague.selectedGames.length > 0) {
			this.betEventService.getBetsForGame(selectedLeague.selectedGames[0].game.GameID).subscribe(bets => {
				this.betList[selectedLeague.league.LeagueID] = bets.filter(b => !this.sportSettings.isDefaultBet(sport, b.BetName));
			});
		}
	}

	loadBets(oddsDisplay: OddsDisplay, sport: Sport, league: League): void {
		var selectedLeague = this.getSelectedLeague(oddsDisplay, sport, league);
		var arr = [];
		var bets = null;
		console.log('gameids', selectedLeague.selectedGames.map(game => game.game.GameID));
		this.betEventService.getBets(selectedLeague.selectedGames.map(game => game.game.GameID), null).subscribe(bets => {

			for (let g of selectedLeague.selectedGames) {
				g.bets = [];
				for (let sb of this.selectedBetList[league.LeagueID]) {
					arr = [];
					//g.bets = bets.filter(b => b.GameID == g.game.GameID && b.BetTypeID == sb.BetTypeID);
					bets.filter(function (b) {
						if (b.GameID == g.game.GameID && b.BetTypeID == sb.BetTypeID && g.bets.indexOf(b) == -1) {
							g.bets.push(b);
						}
					});
				}
			}
		});
	}

	/** Notify the displays to perform a browser refresh. */
	public forceDisplayReload(): void {
		localStorage.setItem("reload", new Date().toString());
	}

	/** Saves the configuration to local storage and reconnects the web socket and display messaging using the newest values. */
	saveConfiguration() {
		if (this.configForm.valid) {
			this.configurationService.updateAndSaveGames(this.model, false);
			this.liveUpdateService.disconnect();
			this.startWebSocketMessaging(this.model);
			this.enableDisplayMessaging();
		} else {
			alert("Please correct errors before saving.");
		}
	}

	selectSport(oddsDisplay: OddsDisplay, sport: Sport): void {
		var sportIndex = oddsDisplay.sports.map(ss => ss.sport).findIndex(s => s.SportID == sport.SportID);
		if (sportIndex == -1) {
			this.loadLeagues(sport);

			oddsDisplay.sports.push(new SelectedSport(sport));
		} else {
			oddsDisplay.sports.splice(sportIndex, 1);
		}
	}

	selectLeague(oddsDisplay: OddsDisplay, sport: Sport, league: League): void {
		var sportIndex = oddsDisplay.sports.map(ss => ss.sport).findIndex(s => s.SportID == sport.SportID);
		var leagueIndex = oddsDisplay.sports[sportIndex].leagues.map(l => l.league).findIndex(l => l.LeagueID == league.LeagueID);

		if (leagueIndex == -1) {
			this.loadGames(league);
			var betStyle = this.sportSettings.hasDefaultStandardBets(sport) ? BetStyle.Standard : BetStyle.Props;
			var leagueAbb = league.LeagueNameAbbreviation;
			var leagueName = league.LeagueName;
			if (leagueAbb == "null" && league.LeagueName.toUpperCase().indexOf('COLLEGE') > -1) {
				leagueAbb = "NCAA"
			} else if (leagueAbb == "null") {
				leagueAbb = league.LeagueName;
				leagueName = "";
			}
				
			oddsDisplay.sports[sportIndex].leagues.push(new SelectedLeague(league, leagueAbb, leagueName, betStyle));

			if (betStyle == BetStyle.Props) {
				this.loadBetList(oddsDisplay, sport, league);
			}
		} else {
			oddsDisplay.sports[sportIndex].leagues.splice(leagueIndex, 1);
		}
	}

	selectGame(oddsDisplay: OddsDisplay, sport: Sport, league: League, game: Game): void {

		var selectedLeague = this.getSelectedLeague(oddsDisplay, sport, league);
		var gameIndex = selectedLeague.selectedGames.map(a => a.game).findIndex(g => g.GameID == game.GameID);
		if (gameIndex == -1) {
			selectedLeague.selectedGames.push(new SelectedGame(game));
		}
		else {
			selectedLeague.selectedGames.splice(gameIndex, 1);
		}

		if (selectedLeague.betStyle == BetStyle.Props) {
			this.loadBetList(oddsDisplay, sport, league);
		}
	}

	selectAllGames(oddsDisplay: OddsDisplay, sport: Sport, league: League): void {
		var selectedLeague = this.getSelectedLeague(oddsDisplay, sport, league);

		if (selectedLeague.selectAllGames) {
			selectedLeague.selectedGames = [];
			selectedLeague.selectedGames = this.games[league.LeagueID].map(game => new SelectedGame(game));

			if (selectedLeague.betStyle == BetStyle.Props) {
				this.loadBetList(oddsDisplay, sport, league);
			}
		}
		else {
			selectedLeague.selectedGames = [];
		}
	}

	selectBet(oddsDisplay: OddsDisplay, sport: Sport, league: League, game: Game, bet: Bet): void {

		var selectedGame = this.getSelectedGame(oddsDisplay, sport, league, game);
		var index = selectedGame.bets.indexOf(bet);

		if (index > -1) {
			selectedGame.bets.splice(index, 1);
		} else {
			selectedGame.bets.push(bet);
		}

		this.loadBets(oddsDisplay, sport, league);
	}
	selectBetList(oddsDisplay: OddsDisplay, sport: Sport, league: League, betTypeId: number): void {
		var bets = this.betList[league.LeagueID].filter(b => b.BetTypeID == betTypeId);
		for (var i = 0; i < bets.length; i++) {
			var bet = bets[i];

			if (this.selectedBetList[league.LeagueID] != undefined) {
				var array = this.selectedBetList[league.LeagueID];
				var index = array.indexOf(bet);
				if (index > -1) {
					this.selectedBetList[league.LeagueID].splice(index, 1);
				} else {
					this.selectedBetList[league.LeagueID].push(bet);
				}
			} else {
				this.selectedBetList[league.LeagueID] = [];
				this.selectedBetList[league.LeagueID].push(bet);
			}

			
		}
		this.loadBets(oddsDisplay, sport, league);
	}

	oddsDisplayHasSport(oddsDisplay: OddsDisplay, sport: Sport): boolean {
		return oddsDisplay.sports.map(ss => ss.sport).findIndex(s => s.SportID == sport.SportID) != -1;
	}

	oddsDisplayHasLeague(oddsDisplay: OddsDisplay, sport: Sport, league: League): boolean {
		var sportIndex = oddsDisplay.sports.map(ss => ss.sport).findIndex(s => s.SportID == sport.SportID);
		return oddsDisplay.sports[sportIndex].leagues.map(l => l.league).findIndex(l => l.LeagueID == league.LeagueID) != -1;
	}

	oddsDisplayHasGame(oddsDisplay: OddsDisplay, sport: Sport, league: League, game: Game): boolean {
		var selectedGame = this.getSelectedGame(oddsDisplay, sport, league, game);
		return selectedGame !== null;
	}

	oddsDisplayHasBet(oddsDisplay: OddsDisplay, sport, league, betTypeId: number): boolean {
		return this.selectedBetList[league.LeagueID] !== undefined && this.selectedBetList[league.LeagueID].find(x => x.BetTypeID == betTypeId) != null;
	}

	showPropBets(oddsDisplay: OddsDisplay, sport: Sport, league: League): boolean {
		return this.getSelectedLeague(oddsDisplay, sport, league).betStyle == 2 && this.betList[league.LeagueID] && this.betList[league.LeagueID].length > 0;
	}

	private loadLeagues(sport: Sport) {
		if (!this.leagues[sport.SportID]) {
			this.betEventService.getLeagues(sport.SportID).subscribe(leagues => {
				this.leagues[sport.SportID] = leagues;
			});
		}
	}

	private loadGames(league: League) {
		if (!this.games[league.LeagueID]) {
			this.betEventService.getGames(league.LeagueID).subscribe(games => {
				var sortedGames;
				sortedGames = games.map(g => g)
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
				this.games[league.LeagueID] = sortedGames;
			});
			this.betEventService.getFutures(league.LeagueID).subscribe(futures => {
				this.futures[league.LeagueID] = futures;
			});
		}
	}

	/** Loads the current data from the API for the values stored in the local configuration. */
	private getDataForSavedModel(): void {
		this.model.oddsDisplays.forEach(oddsDisplay => {
			oddsDisplay.sports.forEach(selectedSport => {
				this.loadLeagues(selectedSport.sport);

				selectedSport.leagues.forEach(selectedLeague => {
					this.loadGames(selectedLeague.league);
					if (selectedLeague.betStyle == BetStyle.Props) {
						this.betEventService.getBetsForGame(selectedLeague.selectedGames[0].game.GameID).subscribe(bets => {
							this.betList[selectedLeague.league.LeagueID] = bets.filter(b => !this.sportSettings.isDefaultBet(selectedSport.sport, b.BetName));

							selectedLeague.selectedGames.forEach(selectedGame => {
								var betTypes = this.groupByPipe.transform(selectedGame.bets, "BetTypeID");

								betTypes.forEach(b => {
									this.selectBetList(oddsDisplay, selectedSport.sport, selectedLeague.league, b.key);
								});
							});
						});
					}
				});
			});
		});
	}

	/** Sets the timer for refreshing the display boards at intervals based on the configuration. */
	private enableDisplayMessaging(): void {
		if (this.displaySubscription != null)
			this.displaySubscription.unsubscribe();

		this.displaySubscription =
			interval(this.model.refresh * 1000)
				.subscribe(() => {
					localStorage.setItem("refresh", Math.random().toString());
				});
	}

	/**
	 * Polls the API once per minute to load refreshed game and bet data
	 */
	private subscribeToDataUpdates() {
		
		if (this.dataSubscription != null)
			this.dataSubscription.unsubscribe();
		var config = this.configurationService.loadUpdateFromStorage();
		this.configurationService.updateAndSaveGames(config, true);

		this.dataSubscription =
			interval(30 * 1000)
				.subscribe(() => {
					var configUpdate = this.configurationService.loadUpdateFromStorage();
					if (configUpdate != null) {

						this.configurationService.updateAndSaveGames(configUpdate, true, true);
					}
				});
	}

	/**
	 * Initializes websocket messaging for every game in the supplied configuration.
	 * @param config The configuration with games to load web socket messages for.
	 */
	private startWebSocketMessaging(config: Configuration): void {
		var gamesIDs = this.configurationService.getDistinctGameIDs(config, null);
		
		//gamesIDs.forEach(gameID => {
		//	this.liveUpdateService.initialize(gameID);
		//});
		this.liveUpdateService.initialize(1);
	}

	/** Creates validators used for validating form. */
	private createValidators() {
		this.configForm = new FormGroup({
			'refresh': new FormControl(this.model.refresh, { validators: [Validators.min(5), Validators.max(999), Validators.required], updateOn: 'blur' }),
			'refreshOverride': new FormControl('', { validators: [Validators.min(5), Validators.max(999), Validators.required], updateOn: 'blur' })
		});

		this.setRefreshValidator();
	}

	/** Sets the value of the override refresh validator and toggles based on if a value has been supplied. */
	private setRefreshValidator() {
		var validator = this.configForm.get("refreshOverride");
		validator.setValue(this.model.oddsDisplays[this.currentDisplayIndex].refreshOverride);

		if (validator.value != null)
			validator.enable();
		else
			validator.disable();
	}
}
