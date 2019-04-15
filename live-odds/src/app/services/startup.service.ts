import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SportSettings, SportBet, BetType, BetName, GameStatus } from '../models/sportsettings';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Sport } from '../models/sport';
import { Bet } from '../models/bet';

@Injectable({
	providedIn: 'root'
})
export class StartupService {
	private settings: SportSettings;

	constructor(private http: HttpClient) {
	}

	public isNonTeamSport(sportId: number): boolean {
		return this.settings.NonTeamSports.indexOf(sportId) > -1;
	}

	public load() {
		return new Promise((resolve, reject) => {
			this.http.get<SportSettings>("./assets/sportsettings.json")
				.subscribe(settings => {
					this.settings = settings;
					resolve(true);
				}, error => {
					reject(error);
				});
		});
	}

	public getCasino(): string {
		return this.settings.Casino;
	}

	public getStandardBetNames(): Array<BetName> {
		return this.settings.StandardBetNames;
	}

	public getGameStatus(): Array<GameStatus> {
		return this.settings.Statuses;
	}

	public hasDefaultStandardBets(sport: Sport) {
		var sportBet = this.getSport(sport);
		return sportBet != null && sportBet.BetTypes != null;
	}

	public getBetByType(type: BetType, sport: Sport, bets: Array<Bet>, isHomeTeam: boolean, getDrawBet?: boolean): Bet {
		if (this.settings == null || this.settings.StandardBetNames == null || this.settings.StandardBetNames.length == 0)
			return null;

		var betNames = this.settings.StandardBetNames.filter(bt => type && bt.BetType === type);
		if (betNames == null || betNames.length == 0)
			return null;

		return this.getBetByName(bets, betNames.map(x => x.BetName), isHomeTeam, getDrawBet);
	}

	public getPropBets(sport: Sport, bets: Array<Bet>): Array<Bet> {
		var sportSetting = this.getSport(sport);

		// No settings exist for this sport, so the bet list doesn't need to be filtered
		if (sportSetting == null || sportSetting.BetTypes == null)
			return bets;

		return bets.filter(b => !this.isDefaultBet(sport, b.BetName));
	}

	public getSport(sport: Sport): SportBet {
		var sportBet = this.settings.Bets.find(x => x.SportId == sport.SportID);

		return sportBet;
	}

	public getHideJuice(sport: Sport): boolean {
		var sportSetting = this.getSport(sport);
		if (sportSetting == null || sportSetting.HideJuice == null)
			return false;

		return sportSetting.HideJuice;
	}

	/**
	 * Returns true if the betName is marked as being a standard bet in the sportsettings.json file
	 * @param sport The sport to check for containing the specified betTypeID
	 * @param betName The betName to check if it is a standard bet
	 */
	public isDefaultBet(sport: Sport, betName: string): boolean {
		if (this.settings == null)
			return false;

		return this.settings.StandardBetNames.find(x => x.BetName.toLowerCase() == betName.toLowerCase()) != null;
	}

	/**
	 * Returns a bet whose name is found in a list of bet names. If multiple matching bets are found, the bet with the lowest bet forecast code is returned.
	 * @param bets Array of bets to parse.
	 * @param betNames Array of potential bet names that the returned bet should be found in.
	 * @param isHomeTeam Boolean to determine if the bet should be associated with the home team.
	 * @param getDrawBet Boolean to determine if the bet could be for a draw result
	 */
	private getBetByName(bets: Array<Bet>, betNames: Array<string>, isHomeTeam: boolean, getDrawBet?: boolean): Bet {
		var potentialBets = bets.filter(bet =>
			betNames.findIndex(bn => bn.toLowerCase() == bet.BetName.toLowerCase()) > -1
			&& ((bet.BetForecastDescriptionEnglish.indexOf(getDrawBet ? "X" : (isHomeTeam ? "1" : "2")) > -1 || bet.BetForecastDescriptionEnglish == (isHomeTeam ? "Under" : "Over"))));

		if (potentialBets == null || potentialBets.length == 0)
			return null;

		return potentialBets.sort((last, next) => last.BetForecastCode > next.BetForecastCode ? 1 : 0)[0];
	}
}