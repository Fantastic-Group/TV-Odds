"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SportSettings = /** @class */ (function () {
    function SportSettings(NonTeamSports, Bets, StandardBetNames, Casino, Statuses) {
        this.NonTeamSports = NonTeamSports;
        this.Bets = Bets;
        this.StandardBetNames = StandardBetNames;
        this.Casino = Casino;
        this.Statuses = Statuses;
    }
    return SportSettings;
}());
exports.SportSettings = SportSettings;
var SportBet = /** @class */ (function () {
    function SportBet(SportId, Name, HideJuice, BetTypes) {
        this.SportId = SportId;
        this.Name = Name;
        this.HideJuice = HideJuice;
        this.BetTypes = BetTypes;
    }
    return SportBet;
}());
exports.SportBet = SportBet;
var BetName = /** @class */ (function () {
    function BetName(BetName, BetType) {
        this.BetName = BetName;
        this.BetType = BetType;
    }
    return BetName;
}());
exports.BetName = BetName;
var GameStatus = /** @class */ (function () {
    function GameStatus(ID, Display, Ignore) {
        this.ID = ID;
        this.Display = Display;
        this.Ignore = Ignore;
    }
    return GameStatus;
}());
exports.GameStatus = GameStatus;
/* All football and basketball should be Spread, Over/Under and then Money Line. In all baseball and hockey, it is Money Line, Over/Under and run line for baseball and goal line for hockey. */
var BetTypeId = /** @class */ (function () {
    function BetTypeId(BetType, ID, Display) {
        this.BetType = BetType;
        this.ID = ID;
        this.Display = Display;
    }
    return BetTypeId;
}());
exports.BetTypeId = BetTypeId;
var BetType;
(function (BetType) {
    BetType[BetType["Spread"] = 1] = "Spread";
    BetType[BetType["MoneyLine"] = 2] = "MoneyLine";
    BetType[BetType["OverUnder"] = 4] = "OverUnder";
})(BetType = exports.BetType || (exports.BetType = {}));
//# sourceMappingURL=sportsettings.js.map