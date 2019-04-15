import { Injectable } from '@angular/core';
import { Configuration, Orientation, OddsDisplay, BetStyle, SelectedSport, SelectedGame } from 'src/app/models/configuration';
import { BetEventService } from './bet-event.service';
import { Bet } from '../models/bet';
import { Game, GameStatus } from '../models/game';
import { StartupService } from './startup.service';
import { forkJoin } from 'rxjs';
import { Score } from '../models/score';

@Injectable({
	providedIn: 'root'
})

export class ConfigurationService {

	public isSaving: boolean;
	public previewDisplay: OddsDisplay;

	constructor(
		private betEventService: BetEventService,
		private sportSettings: StartupService) {
		this.isSaving = false;
	}

	public saveConfigurationToStorage(config: Configuration): Configuration {
		config.lastModified = new Date();
		return this.saveToStorage("config", config);
	}

	public loadConfigurationFromStorage(): Configuration {
		var model = this.loadFromStorage("config");

		return model;
	}

	public saveUpdateToStorage(config: Configuration): Configuration {
		config.lastModified = new Date();

		return this.saveToStorage("updates", config);
	}

	/**
	 * Returns the update object from local storage. If the update object does not exist, the config object will be returned instead.
	 * */
	public loadUpdateFromStorage(): Configuration {
		var update = this.loadFromStorage("updates");

		if (update == null)
			update = this.loadConfigurationFromStorage();

		return update;
	}

	/**
	 * Populates the bets for a given display and returns the updated display object.
	 * @param oddsDisplay The display to load bet information for.
	 * @param refresh The frequency at which the display will refresh.
	 */
	public updatePreviewDisplay(oddsDisplay: OddsDisplay, refresh: number): void {
		this.isSaving = true;
		var config = new Configuration(1, refresh, new Array<OddsDisplay>(oddsDisplay));

		this.updateGames(config, ConfigSaveStyle.Preview);
	}

	/**
	 * Syncs the config object model with up-to-date data from the sports betting platform and saves it as either a new config or as updates to an existing one. 
	 * New configs will force the live odds screen to re-render and start from page one. Updates will just update whatever bet values and start times are displayed on the currently active screen
	 * @param config The config object to modify
	 * @param saveAsUpdate True will cause a soft update to the live odds display, showing updated values but not returning the screen to the first page
	 */
	public updateAndSaveGames(config: Configuration, saveAsUpdate: boolean, subscription?: boolean): void {
		this.isSaving = !saveAsUpdate; // Only update the UI when a user clicks save
		this.updateGames(config, saveAsUpdate ? ConfigSaveStyle.Update : ConfigSaveStyle.Save, subscription);
		
	}

	/**
	 * Updates the game and bet information for a configuration, then performs a save action if required.
	 * @param config The configuration to refresh game and bet information for.
	 * @param saveStyle Enum specifying if the config should be saved and what style of save to perform.
	 * @param subscription if true eliminates from running initial call
	 */
	private updateGames(config: Configuration, saveStyle: ConfigSaveStyle, subscription?: boolean): void {
		if (subscription) {
			this.applyUpdatesToConfiguration(config, saveStyle);
		}
		else {
			this.betEventService.getStandardBets(config.oddsDisplays).subscribe(bets => {
				this.addStandardBetsToGames(config, bets);
				this.removeSportsWithoutBets(config);
				this.applyUpdatesToConfiguration(config, saveStyle);
			}, error => {
				console.log(error);
			});
		}
		
	}

	/**
	 * Removes any selected sports that do not contain leagues, games, and/or bets for an inactive game. Active games will lose their bet information after the game completes.
	 * and should not be removed from the array.
	 * @param config The config model to modify
	 */
	private removeSportsWithoutBets(config: Configuration): void {
		this.removePropBetsFromStandardBetLeagues(config);
		this.removeStandardBetsFromPropBetLeagues(config);
		this.removeGamesWithoutBets(config);
		this.removeLeaguesWithoutGames(config);
		this.removeSportsWithoutLeagues(config);
	}

	/**
	 * Removes any sports without leagues from a config object.
	 * @param config The configuration object to modify
	 */
	private removeSportsWithoutLeagues(config: Configuration) {
		config.oddsDisplays.forEach(odds => {
			odds.sports.filter(selectedSport => selectedSport.leagues.length == 0)
				.forEach(selectedSport => {
					var index = odds.sports.findIndex(x => x.sport.SportID == selectedSport.sport.SportID);
					odds.sports.splice(index, 1);
				});
		});
	}

	/**
	 * Removes any leagues without games from a config object.
	 * @param config The configuration object to modify
	 */
	private removeLeaguesWithoutGames(config: Configuration) {
		config.oddsDisplays.forEach(odds => {
			odds.sports.forEach(selectedSport => {
				selectedSport.leagues.filter(l => l.selectedGames.length == 0)
					.forEach(selectedLeague => {
						var index = selectedSport.leagues.findIndex(x => x.league.LeagueID == selectedLeague.league.LeagueID);
						selectedSport.leagues.splice(index, 1);
					});
			});
		});
	}

	/**
	 * Removes any inactive games without bets from a config object. A game will lose its bets after it completes, but is still needed in the array for showing scores.
	 * @param config The configuration object to modify
	 */
	private removeGamesWithoutBets(config: Configuration) {
		config.oddsDisplays.forEach(odds => {
			odds.sports.forEach(selectedSport => {
				selectedSport.leagues
					.forEach(selectedLeague => {
						selectedLeague.selectedGames.filter(sg => sg.bets.length == 0 && sg.game.STATUS == GameStatus.Inactive)
							.forEach(selectedGame => {
								var index = selectedLeague.selectedGames.findIndex(x => x.game.GameID == selectedGame.game.GameID);
								selectedLeague.selectedGames.splice(index, 1);
							});
					});
			});
		});
	}

	/**
	 * Removes any standard bets that were previously added to a prop bet league.
	 * @param config The configuration object to modify
	 */
	private removeStandardBetsFromPropBetLeagues(config: Configuration) {
		config.oddsDisplays.forEach(odds => {
			odds.sports.forEach(selectedSport => {
				selectedSport.leagues.filter(l => l.betStyle == BetStyle.Props)
					.forEach(selectedLeague => {
						selectedLeague.selectedGames.filter(sg => sg.game.STATUS == GameStatus.Inactive)
							.forEach(selectedGame => {
								selectedGame.bets.filter(b => this.sportSettings.isDefaultBet(selectedSport.sport, b.BetName))
									.forEach(bet => {
										var index = selectedGame.bets.findIndex(x => x.BetForecastCode == bet.BetForecastCode);
										selectedGame.bets.splice(index, 1);
									});
							});
					});
			});
		});
	}

	/**
	 * Removes any prop bets that were previously added to a standard bet league.
	 * @param config The configuration object to modify
	 */
	private removePropBetsFromStandardBetLeagues(config: Configuration) {
		config.oddsDisplays.forEach(odds => {
			odds.sports.forEach(selectedSport => {
				selectedSport.leagues.filter(l => l.betStyle == BetStyle.Standard)
					.forEach(selectedLeague => {
						selectedLeague.selectedGames.filter(sg => sg.game.STATUS == GameStatus.Inactive)
							.forEach(selectedGame => {
								selectedGame.bets.filter(b => !this.sportSettings.isDefaultBet(selectedSport.sport, b.BetName))
									.forEach(bet => {
										var index = selectedGame.bets.findIndex(x => x.BetForecastCode == bet.BetForecastCode);
										selectedGame.bets.splice(index, 1);
									});
							});
					});
			});
		});
	}

	/**
	 * Any game marked as a standard bet style needs to have their bets synced with the default bets that are pulled down based on the sportsettings.json file. Bets will
	 * only be updated for games that have not yet started.
	 * @param config The config object to update
	 * @param bets The default bets that need to be assigned to leagues that have standard bets
	 */
	private addStandardBetsToGames(config: Configuration, bets: Bet[]) {
		config.oddsDisplays.forEach(odds => {
			odds.sports.forEach(selectedSport => {
				selectedSport.leagues.filter(l => l.betStyle == BetStyle.Standard)
					.forEach(selectedLeague => {
						selectedLeague.selectedGames
							.filter(sg => sg.game.STATUS < 6)
							.forEach(selectedGame => {
								selectedGame.bets = bets.filter(b => b.GameID == selectedGame.game.GameID);
							});
					});
			});
		});
	}

	/**
	 * Loads newest score, game and bet data, modifying the config object to reflect the new values before saving to local storage
	 * @param config The config object to modify
	 * @param saveStyle enum of how records should be stored after the configuration data has been updated with refreshed game and bet information
	 */
	private applyUpdatesToConfiguration(config: Configuration, saveStyle: ConfigSaveStyle): void {

		var filteredGameIds = this.getDistinctGameIDs(config, null);

		forkJoin(
			this.betEventService.getScores(filteredGameIds),
			this.betEventService.getGamesById(filteredGameIds),
			this.betEventService.getBets(filteredGameIds, null)
		).subscribe(([scores, games, bets]) => {
			var gamesUpdated = this.refreshGameData(config, games);
			var betsUpdated = this.refreshBetData(config, bets);
			var scoreUpdated = this.refreshScoreData(config, scores); // this needs to be updated last or else it'll be overwritten by the game update

			this.isSaving = false;

			if (saveStyle == ConfigSaveStyle.Update) {
				// Only save if something actually changed
				if (scoreUpdated || gamesUpdated || betsUpdated)
					this.saveUpdateToStorage(config);
			} else if (saveStyle == ConfigSaveStyle.Save) {
				this.saveConfigurationToStorage(config);
				this.removeUpdatesFromStorage();
			} else if (saveStyle == ConfigSaveStyle.Preview) {
				this.previewDisplay = config.oddsDisplays[0];
			}
		});
	}

	/**
	 * Updates the scoring data for a given configuration. Returns true if any scoring information was found and modified.
	 * @param config The config to modify
	 * @param scores Scoring information for games stored in config
	 */
	public refreshScoreData(config: Configuration, scores: Array<Score>): boolean {
		var retVal = false;

		if (scores != null && scores.length > 0) {
			for (var i = 0; i < scores.length; i++) {
				var score = scores[i];
				var selectedGame = this.findmygame(score.GameID, config);
				if (selectedGame !== null && (selectedGame.game.AwayTeamScore != score.BRSCORECURA || selectedGame.game.HomeTeamScore != score.BRSCORECURH || selectedGame.game.BRStatus != score.BRSTATUS)) {
					retVal = true;
					selectedGame.game.AwayTeamScore = score.BRSCORECURA;
					selectedGame.game.HomeTeamScore = score.BRSCORECURH;

					var brstatus = this.sportSettings.getGameStatus().filter(status => score.BRSTATUS == status.ID);
					if (brstatus.length == 1 && !brstatus[0].Ignore)
						selectedGame.game.BRStatus = score.BRSTATUS;
				}
			}



		}

		return retVal;
	}

	/**
	 * Replaces existing game data in config with updated values from server. Returns true if any games were updated with new information.
	 * @param config The config object to modify
	 * @param gameUpdates Array of game objects that will replace matching game objects in the config
	 */
	private refreshGameData(config: Configuration, gameUpdates: Game[]): boolean {
		var isUpdated = false;

		if (gameUpdates !== null && gameUpdates.length > 0) {
			for (var i = 0; i < gameUpdates.length; i++) {
				var update = gameUpdates[i];
				if (update !== null) {

					var selectedGame = this.findmygame(update.GameID, config);
					// Copying score information to new game object to prevent issues when comparing the objects
					update.AwayTeamScore = selectedGame.game.AwayTeamScore;
					update.HomeTeamScore = selectedGame.game.HomeTeamScore;

					var brstatus = this.sportSettings.getGameStatus().filter(status => selectedGame.game.BRStatus == status.ID);
					if (brstatus.length == 1 && !brstatus[0].Ignore)
						update.BRStatus = selectedGame.game.BRStatus;


					// Only update if data has changed
					if (JSON.stringify(selectedGame.game).toLowerCase() != JSON.stringify(update).toLowerCase()) {
						selectedGame.game = update;
						isUpdated = true;
					}
				}
			}
		}

		return isUpdated;
	}

	/**
	 * Replaces existing bet data in config with updated values from server. Returns true if any bets were updated with new information.
	 * @param config The config object to modify
	 * @param betUpdates Array of bet objects that will replace matching bet objects in the config
	 */
	private refreshBetData(config: Configuration, betUpdates: Bet[]): boolean {
		var isUpdated = false;


		for (var i = 0; i < betUpdates.length; i++) {
			var update = betUpdates[i];
			if (update != null) {
				var selectedGame = this.findmygame(update.GameID, config);

				if (selectedGame !== null) {
					for (var i2 = 0; i2 < selectedGame.bets.length; i2++) {
						if (selectedGame.bets[i2].GameID == update.GameID && selectedGame.bets[i2].BetForecastCode == update.BetForecastCode) {
							var bet = selectedGame.bets[i2];
							// Only update if data has changed
							if (JSON.stringify(bet).toLowerCase() !== JSON.stringify(update).toLowerCase()) {
								selectedGame.bets[i2] = update;
								isUpdated = true;
							}
						}
					}
				}
			}
		}

		return isUpdated;
	}

	/**
	 * Returns an array of distinct gameIDs from the suppled config object
	 * @param config The config object containing gameIDs
	 * @param gameStatus The status of the games to find. Null will return all games
	 */
	public getDistinctGameIDs(config: Configuration, gameStatus: GameStatus): Array<number> {
		var gameIDs = new Array<number>();
		config.oddsDisplays.forEach(oddsDisplay => {
			oddsDisplay.sports.forEach(selectedSport => {
				selectedSport.leagues.forEach(selectedLeague => {
					var selectedGames = (gameStatus != null) ? selectedLeague.selectedGames.filter(sg => sg.game.STATUS == gameStatus) : selectedLeague.selectedGames;
					var ids = selectedGames.map(selectedGame => selectedGame.game.GameID);
					gameIDs = gameIDs.concat(ids);
				});
			});
		});

		var filteredIds = gameIDs.filter((value, index, array) => {
			return index == array.indexOf(value);
		});

		return filteredIds;
	}

	private removeUpdatesFromStorage(): void {
		return this.removeFromStorage("updates");
	}

	private saveToStorage(key: string, config: Configuration): Configuration {
		localStorage.setItem(key, JSON.stringify(config));

		return config;
	}

	private loadFromStorage(key): Configuration {
		var model: Configuration;

		var item = localStorage.getItem(key);

		model = JSON.parse(item);

		return model;
	}

	private removeFromStorage(key): void {
		localStorage.removeItem(key);
	}

	public findmygame(gameid: number, config: Configuration): SelectedGame {

		var game = null;
		var selectedGame = null;

		// Giant loop with memo-ized cache of SportIDs/LeagueIDs to find the game as fast as possible:

		var gameIndexes = gamesIndexCache[gameid];
		var LeagueID = null;
		var SportID = null;

		for (var i = 0; i < config.oddsDisplays.length; i++) {
			var o = config.oddsDisplays[i];

			for (var i2 = 0; i2 < o.sports.length; i2++) {
				var s = o.sports[i2];

				if (gameIndexes != null && gameIndexes.SportID != s.sport.SportID) {
					continue;
				}

				for (var i3 = 0; i3 < s.leagues.length; i3++) {
					var l = s.leagues[i3];

					if (gameIndexes != null && gameIndexes.LeagueID != l.league.LeagueID) {
						continue;
					}

					for (var i4 = 0; i4 < l.selectedGames.length; i4++) {
						if (l.selectedGames[i4].game.GameID == gameid) {
							game = l.selectedGames[i4];
							LeagueID = l.league.LeagueID;
							SportID = s.sport.SportID;
							gamesIndexCache[gameid] = { SportID: SportID, LeagueID: LeagueID };
							return game;
							
						}
					}

					// Break the search if this matches:
					if (gameIndexes != null && gameIndexes.LeagueID == l.league.LeagueID) { break; }
					if (game != null) { break; }

				}

				// Break the search if this matches:
				if (gameIndexes != null && gameIndexes.SportID == s.sport.SportID) { break; }

				if (game != null) { break; }
			}
			if (game != null) { break; }

		}


		return game;

	}
}

var gamesIndexCache = {};

export enum ConfigSaveStyle {
	Preview,
	Save,
	Update
};
