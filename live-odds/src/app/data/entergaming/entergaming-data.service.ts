import { Injectable } from '@angular/core';
import { Sport } from '../../models/sport';
import { League } from '../../models/league';
import { Game } from '../../models/game';
import { Bet } from '../../models/bet';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Score } from '../../models/score';
import { BetStyle } from '../../models/configuration';
import { StartupService } from '../../services/startup.service';

@Injectable({
    providedIn: 'root'
})

export class EntergamingDataService {

	private rootUrl = environment.apiServerUrl + "?sql=";
	private enterGamingTimezone = environment.timezone;

    private sportSQL =
        'SELECT ' +
        '	ett.ET_ID AS SportID, ' +
        '	ett.ET_NAME AS SportName, ' +
        '	ett.ET_NAME_ABB AS SportNameAbbreviation ' +
        'FROM EVENT_TYPES_TRANSLATION ett ' +
        '	JOIN EVENT_TYPES et ON et.ET_ID = ett.ET_ID ' +
        'WHERE ett.ETT_LANG="cy" ';

    private leagueSQL =
        'SELECT DISTINCT ' + 
        '	League.TID AS LeagueID, ' + 
        '	League.TNAME AS LeagueName, ' + 
        '	League.TNAME_ABB AS LeagueNameAbbreviation, ' + 
        '	Sport.ET_ID AS SportID ' + 
        'FROM BET_EVENTS Game ' +
        '	JOIN TOURNAMENTS_TRANSLATION League ON League.TID = Game.TOURN_ID ' +
        '	JOIN EVENT_TYPES_TRANSLATION Sport ON Sport.ET_ID = Game.EVENT_TYPE ' +
        'WHERE  ' +
        '	Game.ACTUAL_DATE > DATETIME("now", "localtime") AND  ' +
        '	Game.STATUS > 0 AND  ' +
        '	League.tlang = "CY" AND  ' +
        '	Sport.ett_lang ="CY" ';

    private gameSQL =
        'SELECT ' +
        '    GameComment.Comment AS GameComment, ' +
        '    Game.ACTUAL_DATE AS ActualDate, ' +
        //'    Game.BET_START_DATE AS BetStartDate, ' +
        '    Game.SCD_DATE AS ScheduledDate, ' +
        '    Game.DISPLAY_DATE AS DisplayDate, ' +
       // '    Game.LIVE_DATE AS LiveDate, ' +
        '    Game.ANTEPOST AS Antepost, ' +
        '    Game.BIOS_CODE As BiosCode, ' +
        '    Game.EVENT_CODE As EventCode, ' +
        //'    Game.EVT_COMMENT As EventComment,' +
        //'    Game.EVT_COMMENT_UNC As EventCommentUnc,' +
        '    Game.STATUS, ' +
        //'    Game.FSCORE1, ' +
        //'    Game.FSCORE2, ' +
        //'    Game.LIVE_SC1, ' +
        //'    Game.LIVE_SC2, ' +
        //'    Game.SCORE1, ' +
        //'    Game.SCORE2, ' +
        '    Game.TOURN_ID AS LeagueID, ' +
        '    Game.EVENT_TYPE AS SportID, ' +
        '    Game.EVENT_ID AS GameID, ' +
        //'    Game.HANDICAP1 AS AwayTeamHandicap, ' +
        //'    Game.HANDICAP2 AS HomeTeamHandicap, ' +
        //'    Game.ODDS_1, ' +
        //'    Game.ODDS_1OR2, ' +
        //'    Game.ODDS_1ORX, ' +
        //'    Game.ODDS_2, ' +
        //'    DecToUS(Game.ODDS_1) AS OddsAwayTeam, ' +
        //'    DecToUS(Game.ODDS_1OR2) AS OddsHomeOrAwayTeam, ' +
        //'    DecToUS(Game.ODDS_1ORX) AS OddsTieOrAwayTeam, ' +
        //'    DecToUS(Game.ODDS_2) AS OddsHomeTeam, ' +
        //'    Game.ODDS_REVISION, ' +
        //'    Game.ODDS_X, ' +
        //'    Game.ODDS_XOR2, ' +
        //'    DecToUS(Game.ODDS_X) AS OddsTie, ' +
        //'    DecToUS(Game.ODDS_XOR2) AS OddsTieOrHomeTeam, ' +
        //'    HomeTeam.TEAM_ID AS HomeTeamID, ' +
        '    HomeTeam.TEAM_NAME AS HomeTeamName, ' +
        '    HomeTeam.TEAM_NAME_ABB AS HomeTeamAlias, ' +
        //'    HomeTeam.TEAM_NAME_LC AS HomeTeamNameLC, ' +
        //'    AwayTeam.TEAM_ID AS AwayTeamID, ' +
        '    AwayTeam.TEAM_NAME AS AwayTeamName, ' +
        '    AwayTeam.TEAM_NAME_ABB AS AwayTeamAlias ' +
        //'    AwayTeam.TEAM_NAME_LC AS AwayTeamNameLC ' +
        'FROM BET_EVENTS Game ' +
        '	JOIN TEAMS_TRANSLATION HomeTeam ON Game.TEAM1_ID = HomeTeam.TEAM_ID ' +
        '	JOIN TEAMS_TRANSLATION AwayTeam ON Game.TEAM2_ID = AwayTeam.TEAM_ID ' +
        '	JOIN TOURNAMENTS_TRANSLATION League ON League.TID = Game.TOURN_ID ' +
        '	JOIN EVENT_TYPES_TRANSLATION Sport ON Sport.ET_ID = Game.EVENT_TYPE ' +
        '   LEFT OUTER JOIN WSBET_EVENTS_COMMENT GameComment ON GameComment.EVENT_ID = Game.EVENT_ID ' +
        'WHERE ' +
        '	HomeTeam.team_lang = "CY" AND ' +
        '	AwayTeam.team_lang = "CY" AND ' +
        '	League.tlang = "CY" AND ' +
        '	Sport.ett_lang ="CY" AND ' +
        '   (GameComment.LANG IS NULL OR GameComment.LANG = "CY")';

    private betSQL =
        'SELECT  ' +
            'GAMES_TRANSLATION.GAME_NAME AS BetName, ' + 
            'GAMES_TRANSLATION.GAME_NAME_ABB AS BetNameAbbreviation, ' + 
           // 'GAMES_TRANSLATION.GAME_NAME_LC AS Bet_NAME_LC, ' + 
            'GAMES.GAME_ID AS BetTypeID, ' + 
		'GAMES.GAME_CODE_LOCAL AS BetCode, ' + 
		'GAME.STATUS, '+
            //'GAMES.MAX_BETS AS MaxBets, ' + 
            //'GAMES.GAME_ENABLED AS BetTypeEnabled, ' + 
           // 'GAMES.START_FC AS BetType_START_FC, ' + 
           // 'GAMES.END_FC AS BetType_END_FC, ' + 
           // 'GAMES.CALC_WIN_PROC AS BetType_CALC_WIN_PROC, ' + 
           // 'GAMES.CALC_WIN_PROC2 AS BetType_CALC_WIN_PROC2, ' + 
           // 'GAMES.FC_TYPE AS BetType_FC_TYPE, ' + 
           // 'GAMES.MASTER_GAME AS BetType_MASTER_GAME, ' + 
            //'GAMES.USE_OVERROUND AS BetType_USE_OVERROUND, ' + 
            //'GAMES.NORMALISE_CHART AS BetType_NORMALISE_CHART, ' + 
            //'GAMES.CW_USESCORES AS BetType_CW_USESCORES, ' + 
            //'GAMES.CW_SC1 AS BetType_CW_SC1, ' + 
            //'GAMES.CW_SC2 AS BetType_CW_SC2, ' + 
            //'GAMES.CW_NO_WIN AS BetType_CW_NO_WIN, ' + 
            //'GAMES.CW_LIVE_STATUS AS BetType_CW_LIVE_STATUS, ' + 
            //'GAMES.GAME_OVR_GROUP AS BetType_GAME_OVR_GROUP, ' + 
            //'GAMES.USE_SMEQUAL_CHART AS BetType_USE_SMEQUAL_CHART, ' + 
            //'GAMES.BORROW_CHART_GID AS BetType_BORROW_CHART_GID, ' + 
            'BET_GAMES.EVENT_ID AS GameID, ' + 
            'BET_GAMES.START_DATE AS BetStartDate, ' + 
            //'BET_GAMES.END_DATE AS BetEndDate, ' + 
            //'BET_GAMES.HANDICAP1 AS BetAwayTeamHandicap, ' + 
            //'BET_GAMES.HANDICAP2 AS BetHomeTeamHandicap, ' + 
            //'BET_GAMES.CHART_NAME AS Bet_CHART_NAME, ' + 
            //'BET_GAMES.SPECIAL AS Bet_SPECIAL, ' + 
            'BET_GAMES.ISLIVE AS Bet_ISLIVE, ' + 
            //'BET_GAMES.CHART_DESCR AS Bet_CHART_DESCR, ' + 
            //'BET_GAMES.SC1 AS Bet_AwayTeamScore, ' + 
            //'BET_GAMES.SC2 AS Bet_HomeTeamScore, ' + 
            //'BET_GAMES.DISPLAY_FLAG AS Bet_DISPLAY_FLAG, ' + 
			//'BET_FORECASTS.ODDS, ' + 
            'DecToUS(BET_FORECASTS.ODDS) AS BetForecastOdds, ' + 
            'BET_FORECASTS.FORECAST_CD AS BetForecastCode, ' + 
            'BET_FORECASTS.DESCR AS BetForecastDescription, ' + 
            'BET_FORECASTS.FC_STATUS AS BetForecastStatus, ' + 
            //'BET_FORECASTS.FC_WIN AS BetForecast_Win, ' + 
            //'BET_FORECASTS.REV_ID AS BetForecast_REV_ID, ' + 
            //'BET_FORECASTS.ODDS_CHANGED AS BetForecastOddsChanged, ' + 
            //'BET_FORECASTS.ISCURRENT AS BetForecast_ISCURRENT, ' + 
            //'BET_FORECASTS.FC_FROM AS BetForecastFromDate, ' + 
            //'BET_FORECASTS.FC_TO AS BetForecastToDate, ' + 
            //'BET_FORECASTS.TEAM_ID AS BetForecast_TEAM_ID, ' + 
            //'BET_FORECASTS.FC_PLAYER_ID AS BetForecast_PLAYER_ID, ' + 
            'BET_FORECASTS.DESCR_EN AS BetForecastDescriptionEnglish, ' + 
            'BET_FORECASTS.FC_PARAM AS BetForecast_PARAM ' + 
         //   'BET_FORECASTS.FC_UID AS BetForecast_UID, ' + 
	        //'BET_FORECASTS.ODDS_NORMAL AS BetForecast_ODDS_NORMAL ' + 
        'FROM ' +
        '	BET_GAMES ' +
        '	JOIN GAMES ON GAMES.GAME_ID = BET_GAMES.GAME_ID ' +
        '	JOIN GAMES_TRANSLATION ON GAMES_TRANSLATION.GAME_ID = BET_GAMES.GAME_ID ' +
        '	JOIN BET_FORECASTS ON BET_FORECASTS.GAME_ID = BET_GAMES.GAME_ID ' +
		'	JOIN BET_EVENTS GAME ON GAME.EVENT_ID = BET_GAMES.EVENT_ID ' +
		'WHERE  ' +
		//' GAME.STATUS = 1 AND ' +
        '	GAMES_TRANSLATION.GTT_LANG = "CY" AND ' +
        '	BET_GAMES.EVENT_ID = BET_FORECASTS.EVENT_ID ';

	private scoreSQL = "SELECT " +
		"BET_EVENTS.EVENT_ID as GameID," +
		//"BRLIVE.BRLIVESTR," +
		"BRLIVE.BRSCORECURA," +
		"BRLIVE.BRSCORECURH," +
		"BRLIVE.BRSTATUS " +
		"FROM BRLIVE " +
		"JOIN BET_EVENTS ON BRLIVE.ID = BET_EVENTS.LIVE_ID " +
		" WHERE BRLIVE.BRSTATUS <> 0 AND ";

  constructor(private http: HttpClient, private sportSettings: StartupService) { }

    getSports(): Observable<Array<Sport>> {
        return this.http.get<Array<Sport>>(this.rootUrl + encodeURIComponent(this.sportSQL)).pipe<Array<Sport>>(map(result => {
            // If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
            if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
                return new Array<Sport>();
            }

            //for (var i = 0; i < result.length; i++) {
            //    result[i] = this._parseSport(result[i]);
            //}

            return result;
        }));
    }

    getSport(sportID: number): Observable<Sport> {
        return this.http.get<Sport>(this.rootUrl + encodeURIComponent(this.sportSQL +
            " AND ett.ET_ID = " + sportID.toString())).pipe<Sport>(map(result => {
                // If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
                if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
                    return null;
                }

                if (result[0] == null || result[0] == undefined) {
                    return null;
                }

                return result[0];
            }));
    }

    getLeagues(sportID: number): Observable<Array<League>> {
        return this.http.get<Array<League>>(this.rootUrl + encodeURIComponent(this.leagueSQL +
            " AND Game.EVENT_TYPE = " + sportID.toString())).pipe<Array<League>>(map(result => {
                // If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
                if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
                    return new Array<League>();
                }

                //for (var i = 0; i < result.length; i++) {
                //    result[i] = this._parseLeague(result[i]);
                //}

                return result;
            }));
    }

    getLeague(leagueID: number): Observable<League> {
        return this.http.get<League>(this.rootUrl + encodeURIComponent(this.leagueSQL +
            " AND League.TID = " + leagueID.toString())).pipe<League>(map(result => {
                // If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
                if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
                    return null;
                }

                if (result[0] == null || result[0] == undefined) {
                    return null;
                }

                return result[0];
            }));
    }

	getScore(gameID: number): Observable<Score> {
		return this.http.get<Score>(this.rootUrl + encodeURIComponent(this.scoreSQL + ` BET_EVENTS.EVENT_ID = ${gameID} `))
			.pipe<Score>(map(result => {
				// If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
				if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
					return null;
				}

				if (result[0] == null || result[0] == undefined) {
					return null;
				}

				return result;
			}));
	}

	getScores(gameID: Array<number>): Observable<Array<Score>> {
		return this.http.get<Array<Score>>(this.rootUrl + encodeURIComponent(this.scoreSQL + ` BET_EVENTS.EVENT_ID IN (${gameID.join(",")}) `))
			.pipe<Array<Score>>(map(result => {
				// If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
				if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
					return null;
				}

				if (result[0] == null || result[0] == undefined) {
					return null;
				}

				return result;
			}));
	}

    getGames(leagueID: number): Observable<Array<Game>> {
        return this.http.get<Array<Game>>(this.rootUrl + encodeURIComponent(this.gameSQL +
            ' AND Game.ACTUAL_DATE > DATETIME("now", "localtime") AND ' +
            ' Game.status > 0 AND ' +
            ' Game.TOURN_ID = ' + leagueID.toString() + 
            ' ORDER BY Game.ACTUAL_DATE')).pipe<Array<Game>>(map(result =>
            {
                // If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
                if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
                    return new Array<Game>();
                }

                for (var i = 0; i < result.length; i++) {
                    result[i] = this._parseGame(result[i]);
                }

                return result;
            }));
	}

	getGamesById(gameIDs: Array<number>): any {
		return this.http.get<Array<Game>>(this.rootUrl + encodeURIComponent(this.gameSQL +
			` AND Game.EVENT_ID in (${gameIDs.join(",")})`)).pipe<Array<Game>>(map(result => {
				// If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
				if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
					return new Array<Game>();
				}

				for (var i = 0; i < result.length; i++) {
					result[i] = this._parseGame(result[i]);
				}

				return result;
			}));
	}

    getGame(gameID: number): Observable<Game> {
        return this.http.get<Game>(this.rootUrl + encodeURIComponent(this.gameSQL +
            " AND Game.EVENT_ID = " + gameID.toString())).pipe<Game>(map(result =>
            {
                // If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
                if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
                    return null;
                }

                if (result[0] == null || result[0] == undefined) {
                    return null;
                }

                return this._parseGame(result[0]);
            }));
	}

	/**
	 * Returns all bets of a given bet style for a list of games.
	 * @param gameID Array of gameIDs to load bets for.
	 * @param betStyle The type of bets to load. Null will return all bets for the games
	 */
	getBets(gameID: Array<number>, betStyle: BetStyle): Observable<Array<Bet>> {
		var sql = this.betSQL + ` AND BET_GAMES.EVENT_ID IN (${gameID.join(",")})`;

		if (betStyle == BetStyle.Standard) {
			sql += ` AND games_translation.game_name in ( ${this.sportSettings.getStandardBetNames().map(x => "'" + x.BetName + "'").join(",")})`;
		} else if (betStyle == BetStyle.Props) {
			sql += ` AND games_translation.game_name not in ( ${this.sportSettings.getStandardBetNames().map(x => "'" + x.BetName + "'").join(",")})`;
		}

		return this.http.get<Array<Bet>>(this.rootUrl + encodeURIComponent(sql)).pipe<Array<Bet>>(map(result => {
				// If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
				if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
					return new Array<Bet>();
				}

				for (var i = 0; i < result.length; i++) {
					result[i] = this._parseBet(result[i]);
				}

				return result;
			}));
	};
	
	getFutures(leagueId: number): Observable<Array<Bet>> {
		return this.http.get<Array<Bet>>(this.rootUrl + encodeURIComponent(this.betSQL +
			` AND GAME.ANTEPOST = 1 AND Game.TOURN_ID=${leagueId} `)).pipe<Array<Bet>>(map(result => {
				// If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
				if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
					return new Array<Bet>();
				}

				for (var i = 0; i < result.length; i++) {
					result[i] = this._parseBet(result[i]);
				}

				return result;
			}));
	}

    getBetsForGame(gameID: number): Observable<Array<Bet>> {
        return this.http.get<Array<Bet>>(this.rootUrl + encodeURIComponent(this.betSQL +
            " AND BET_GAMES.EVENT_ID = " + gameID.toString())).pipe<Array<Bet>>(map(result => {
                // If no results come back, instead of sending an empty list, EnterGaming sends { rowCount: 0, ... } with some other fields detailing the rows expected
                if (result == null || ((<any>result).rowCount != null && (<any>result).rowCount == 0)) {
                    return new Array<Bet>();
                }

                for (var i = 0; i < result.length; i++) {
                    result[i] = this._parseBet(result[i]);
                }

                return result;
            }));
    }

    _parseGame(game: any): Game {
        if (game === null || game === undefined) {
            return null;
        }
		if (game.EventCode < game.BiosCode) {
			return new Game(
				this._parseEnterGamingDate(game.ActualDate),
				//this._parseEnterGamingDate(game.BetStartDate),
				this._parseEnterGamingDate(game.ScheduledDate),
				this._parseEnterGamingDate(game.DisplayDate),
			//	this._parseEnterGamingDate(game.LiveDate),
				this._parseBooleanFromBit(game.Antepost),
				game.STATUS,
				game.LeagueID,
				game.SportID,
				game.GameID,
				game.AwayTeamID,
				this._fixNullName(game.AwayTeamName),
				this._fixNullName(game.AwayTeamAlias),
				game.HomeTeamID,
				this._fixNullName(game.HomeTeamName),
				this._fixNullName(game.HomeTeamAlias),
				game.BiosCode,
				game.EventCode,
				this._fixNullName(game.GameComment),
				(game.EventCode < game.BiosCode)
			);
		}
        return new Game(
            this._parseEnterGamingDate(game.ActualDate),
           // this._parseEnterGamingDate(game.BetStartDate),
            this._parseEnterGamingDate(game.ScheduledDate),
            this._parseEnterGamingDate(game.DisplayDate),
          //  this._parseEnterGamingDate(game.LiveDate),
            this._parseBooleanFromBit(game.Antepost),
            game.STATUS,
            game.LeagueID,
            game.SportID,
            game.GameID,
            game.HomeTeamID,
            this._fixNullName(game.HomeTeamName),
            this._fixNullName(game.HomeTeamAlias),
            game.AwayTeamID,
            this._fixNullName(game.AwayTeamName),
			this._fixNullName(game.AwayTeamAlias),
			game.EventCode,
			game.BiosCode,
			this._fixNullName(game.GameComment),
			(game.EventCode < game.BiosCode)
        );
    }

    _parseBet(bet: any): Bet {
        if (bet === null || bet === undefined) {
            return null;
        }

        return new Bet(
            bet.BetName,
            bet.BetNameAbbreviation,
            bet.BetTypeID,
            bet.BetCode,
            bet.GameID,
            this._parseBooleanFromBit(bet.Bet_ISLIVE),
            bet.BetForecastOdds,
            bet.BetForecastCode,
            bet.BetForecastDescription,
			bet.BetForecastStatus,
            bet.BetForecastDescriptionEnglish,
            bet.BetForecast_PARAM);
    }

    _fixNullName(name: string): string {
        if (name === null || name === undefined) {
            return null;
        }

        if (name == "" || name.toLowerCase() === "null") {
            return null;
        }

        return name;
    }

    _parseEnterGamingDate(dateString: string): Date {
        if (dateString === null || dateString === undefined || dateString === "") {
            return null;
        }

        // TODO: Figure out something with timezones
        // EnterGaming does NOT send the timezone with their data so it's pretty much a guess. 
        var dt = new Date(dateString + this.enterGamingTimezone); // Convert EnterGaming's ??? timezone to UTC (Not sure if this will be constant to final version)
        // If you ignore a timezone, say, new Date("2018-07-02T16:00:00"), javascript will ignore the timezone and it will be in whatever EnterGaming's timezone
        // If you specify a timezone, say new Date("2018-07-02T16:00:00+02:00"), javascript will parse with the timezone, then convert it into local timezone automatically 

        // If it's an invalid date, EnterGaming may have specified just a date, like "2018-06-27". 
        // "2018-06-27+02:00" doesn't parse properly and will be invalid, so just try parsing it exactly:
        if (isNaN(dt.getTime())) {
            dt = new Date(dateString + " 12:00:00"); // Add 12AM to try and get it to parse as a date
        }

        return dt;
    }

    _parseBooleanFromBit(bitValue: number): boolean {
        return ((bitValue == 1) ? true : false);
    }
}
