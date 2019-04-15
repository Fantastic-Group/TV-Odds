import { Injectable } from '@angular/core';
import { Sport } from '../models/sport';
import { League } from '../models/league';
import { Game } from '../models/game';
import { Bet } from '../models/bet';
import { EntergamingDataService } from '../data/entergaming/entergaming-data.service';
import { Observable } from 'rxjs';
import { OddsDisplay, BetStyle } from '../models/configuration';
import { Score } from '../models/score';

@Injectable({
  providedIn: 'root'
})
export class BetEventService {
  constructor(private entergamingDataService: EntergamingDataService) { }

    getSports(): Observable<Array<Sport>> {
        return this.entergamingDataService.getSports();
    }
    getSport(sportID: number): Observable<Sport> {
        return this.entergamingDataService.getSport(sportID);
    }
    getLeagues(sportID: number): Observable<Array<League>> {
        return this.entergamingDataService.getLeagues(sportID);
    }
    getLeague(leagueID: number): Observable<League> {
        return this.entergamingDataService.getLeague(leagueID);
    }
    getGames(leagueID: number): Observable<Array<Game>> {
        return this.entergamingDataService.getGames(leagueID);
    }
	getGamesById(gameIDs: Array<number>): Observable<Array<Game>> {
		return this.entergamingDataService.getGamesById(gameIDs);
	}
    getGame(gameID: number): Observable<Game> {
        return this.entergamingDataService.getGame(gameID);
	}

	/**
	 * Returns all bets of a given bet style for a list of games.
	 * @param gameID Array of gameIDs to load bets for.
	 * @param betStyle The type of bets to load. Null will return all bets for the games
	 */
	getBets(gameID: Array<number>, betStyle: BetStyle): Observable<Array<Bet>> {
		return this.entergamingDataService.getBets(gameID, betStyle);
	}

	/**
	 * Returns all bets available for a given game.
	 * @param gameID The gameID used to determine which bets to load/
	 */
    getBetsForGame(gameID: number): Observable<Array<Bet>> {
        return this.entergamingDataService.getBetsForGame(gameID);
	}
	getFutures(leagueId: number): Observable<Array<Bet>> {
		return this.entergamingDataService.getFutures(leagueId);
	}
	getScore(gameID: number): Observable<Score> {
		return this.entergamingDataService.getScore(gameID);
	}
	getScores(gameID: Array<number>): Observable<Array<Score>> {
		return this.entergamingDataService.getScores(gameID);
	}

	/**
	 * Returns all standard bets for games contained in the specified odds displays.
	 * @param oddsDisplays Array of odds displays containing games to load standard bets for.
	 */
	getStandardBets(oddsDisplays: OddsDisplay[]): Observable<Bet[]> {
		return this.getBetsByStyle(oddsDisplays, BetStyle.Standard);
	}

	/**
	 * Returns all potential prop bets for games contained in the specified odds displays.
	 * @param oddsDisplays Array of odds displays containing games to load prop bets for.
	 */
	getPropBets(oddsDisplays: OddsDisplay[]): Observable<Bet[]> {
		return this.getBetsByStyle(oddsDisplays, BetStyle.Props);
	}

	/**
	 * Returns all bets for a given bet style for games contained in the odds displays.
	 * @param oddsDisplays Array of odds displays containing games to load bets for.
	 * @param betStyle The style of the bets to load.
	 */
	private getBetsByStyle(oddsDisplays: OddsDisplay[], betStyle: BetStyle): Observable<Bet[]> {
		var gameIds = new Array<number>();

		oddsDisplays.forEach(display => {
			display.sports.forEach(selectedSport => {
				selectedSport.leagues
					.filter(l => l.betStyle == betStyle)
					.forEach(selectedLeague => {
						gameIds = gameIds.concat(selectedLeague.selectedGames.map(x => x.game.GameID));
					});
			});
		});

		return this.getBets(gameIds, betStyle);
	}
}
