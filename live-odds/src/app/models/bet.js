"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Bet = /** @class */ (function () {
    function Bet(BetName, BetNameAbbreviation, Bet_NAME_LC, BetTypeID, BetCode, MaxBets, BetTypeEnabled, BetType_START_FC, BetType_END_FC, BetType_CALC_WIN_PROC, BetType_CALC_WIN_PROC2, BetType_FC_TYPE, BetType_MASTER_GAME, BetType_USE_OVERROUND, BetType_NORMALISE_CHART, BetType_CW_USESCORES, BetType_CW_SC1, // "null" sometimes passed instead of null
    BetType_CW_SC2, // "null" sometimes passed instead of null
    BetType_CW_NO_WIN, // "null" sometimes passed instead of null
    BetType_CW_LIVE_STATUS, BetType_GAME_OVR_GROUP, BetType_USE_SMEQUAL_CHART, BetType_BORROW_CHART_GID, GameID, BetStartDate, BetEndDate, BetAwayTeamHandicap, BetHomeTeamHandicap, Bet_CHART_NAME, Bet_SPECIAL, Bet_ISLIVE, Bet_CHART_DESCR, // "null" sometimes passed instead of null
    Bet_AwayTeamScore, Bet_HomeTeamScore, Bet_DISPLAY_FLAG, BetForecastOdds, BetForecastCode, BetForecastDescription, BetForecastStatus, BetForecast_Win, BetForecast_REV_ID, BetForecastOddsChanged, BetForecast_ISCURRENT, BetForecastFromDate, BetForecastToDate, BetForecast_TEAM_ID, BetForecast_PLAYER_ID, BetForecastDescriptionEnglish, BetForecast_PARAM, BetForecast_UID, BetForecast_ODDS_NORMAL, showJuice) {
        this.BetName = BetName;
        this.BetNameAbbreviation = BetNameAbbreviation;
        this.Bet_NAME_LC = Bet_NAME_LC;
        this.BetTypeID = BetTypeID;
        this.BetCode = BetCode;
        this.MaxBets = MaxBets;
        this.BetTypeEnabled = BetTypeEnabled;
        this.BetType_START_FC = BetType_START_FC;
        this.BetType_END_FC = BetType_END_FC;
        this.BetType_CALC_WIN_PROC = BetType_CALC_WIN_PROC;
        this.BetType_CALC_WIN_PROC2 = BetType_CALC_WIN_PROC2;
        this.BetType_FC_TYPE = BetType_FC_TYPE;
        this.BetType_MASTER_GAME = BetType_MASTER_GAME;
        this.BetType_USE_OVERROUND = BetType_USE_OVERROUND;
        this.BetType_NORMALISE_CHART = BetType_NORMALISE_CHART;
        this.BetType_CW_USESCORES = BetType_CW_USESCORES;
        this.BetType_CW_SC1 = BetType_CW_SC1;
        this.BetType_CW_SC2 = BetType_CW_SC2;
        this.BetType_CW_NO_WIN = BetType_CW_NO_WIN;
        this.BetType_CW_LIVE_STATUS = BetType_CW_LIVE_STATUS;
        this.BetType_GAME_OVR_GROUP = BetType_GAME_OVR_GROUP;
        this.BetType_USE_SMEQUAL_CHART = BetType_USE_SMEQUAL_CHART;
        this.BetType_BORROW_CHART_GID = BetType_BORROW_CHART_GID;
        this.GameID = GameID;
        this.BetStartDate = BetStartDate;
        this.BetEndDate = BetEndDate;
        this.BetAwayTeamHandicap = BetAwayTeamHandicap;
        this.BetHomeTeamHandicap = BetHomeTeamHandicap;
        this.Bet_CHART_NAME = Bet_CHART_NAME;
        this.Bet_SPECIAL = Bet_SPECIAL;
        this.Bet_ISLIVE = Bet_ISLIVE;
        this.Bet_CHART_DESCR = Bet_CHART_DESCR;
        this.Bet_AwayTeamScore = Bet_AwayTeamScore;
        this.Bet_HomeTeamScore = Bet_HomeTeamScore;
        this.Bet_DISPLAY_FLAG = Bet_DISPLAY_FLAG;
        this.BetForecastOdds = BetForecastOdds;
        this.BetForecastCode = BetForecastCode;
        this.BetForecastDescription = BetForecastDescription;
        this.BetForecastStatus = BetForecastStatus;
        this.BetForecast_Win = BetForecast_Win;
        this.BetForecast_REV_ID = BetForecast_REV_ID;
        this.BetForecastOddsChanged = BetForecastOddsChanged;
        this.BetForecast_ISCURRENT = BetForecast_ISCURRENT;
        this.BetForecastFromDate = BetForecastFromDate;
        this.BetForecastToDate = BetForecastToDate;
        this.BetForecast_TEAM_ID = BetForecast_TEAM_ID;
        this.BetForecast_PLAYER_ID = BetForecast_PLAYER_ID;
        this.BetForecastDescriptionEnglish = BetForecastDescriptionEnglish;
        this.BetForecast_PARAM = BetForecast_PARAM;
        this.BetForecast_UID = BetForecast_UID;
        this.BetForecast_ODDS_NORMAL = BetForecast_ODDS_NORMAL;
        this.showJuice = showJuice;
    }
    Bet.prototype.setShowJuice = function (x) {
        this.showJuice = x;
    };
    return Bet;
}());
exports.Bet = Bet;
//# sourceMappingURL=bet.js.map