"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Configuration = /** @class */ (function () {
    function Configuration(totalDisplays, refresh, oddsDisplays) {
        this.totalDisplays = totalDisplays;
        this.refresh = refresh;
        this.oddsDisplays = oddsDisplays;
    }
    return Configuration;
}());
exports.Configuration = Configuration;
var OddsDisplay = /** @class */ (function () {
    function OddsDisplay(displayNumber, orientation) {
        this.displayNumber = displayNumber;
        this.orientation = orientation;
        this.HDDisplay = false;
        this.sports = [];
    }
    return OddsDisplay;
}());
exports.OddsDisplay = OddsDisplay;
exports.typeOfDisplay = ['Pre-Game', 'In Play'];
var Orientation;
(function (Orientation) {
    Orientation[Orientation["Horizontal"] = 0] = "Horizontal";
    Orientation[Orientation["Vertical"] = 1] = "Vertical";
})(Orientation = exports.Orientation || (exports.Orientation = {}));
;
var BetStyle;
(function (BetStyle) {
    BetStyle[BetStyle["Standard"] = 1] = "Standard";
    BetStyle[BetStyle["Props"] = 2] = "Props";
})(BetStyle = exports.BetStyle || (exports.BetStyle = {}));
var SelectedSport = /** @class */ (function () {
    function SelectedSport(sport) {
        this.sport = sport;
        this.leagues = [];
    }
    return SelectedSport;
}());
exports.SelectedSport = SelectedSport;
var SelectedLeague = /** @class */ (function () {
    function SelectedLeague(league, header, subHeader, betStyle) {
        this.league = league;
        this.header = header;
        this.subHeader = subHeader;
        this.betStyle = betStyle;
        this.selectedGames = [];
        this.overUnderShowJuice = false;
        this.spreadShowJuice = false;
        this.futures = false;
    }
    return SelectedLeague;
}());
exports.SelectedLeague = SelectedLeague;
var SelectedGame = /** @class */ (function () {
    function SelectedGame(game) {
        this.game = game;
        this.bets = [];
    }
    return SelectedGame;
}());
exports.SelectedGame = SelectedGame;
//# sourceMappingURL=configuration.js.map