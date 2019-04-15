"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game = /** @class */ (function () {
    function Game(ActualDate, 
    //public BetStartDate: Date, 
    ScheduledDate, DisplayDate, 
    // public LiveDate: Date, 
    Antepost, STATUS, LeagueID, SportID, GameID, HomeTeamID, HomeTeamName, // "null" sometimes passed instead of null
    HomeTeamAlias, // "null" sometimes passed instead of null
    AwayTeamID, AwayTeamName, // "null" sometimes passed instead of null
    AwayTeamAlias, HomeRotationNum, AwayRotationNum, Comment, Switch) {
        this.ActualDate = ActualDate;
        this.ScheduledDate = ScheduledDate;
        this.DisplayDate = DisplayDate;
        this.Antepost = Antepost;
        this.STATUS = STATUS;
        this.LeagueID = LeagueID;
        this.SportID = SportID;
        this.GameID = GameID;
        this.HomeTeamID = HomeTeamID;
        this.HomeTeamName = HomeTeamName;
        this.HomeTeamAlias = HomeTeamAlias;
        this.AwayTeamID = AwayTeamID;
        this.AwayTeamName = AwayTeamName;
        this.AwayTeamAlias = AwayTeamAlias;
        this.HomeRotationNum = HomeRotationNum;
        this.AwayRotationNum = AwayRotationNum;
        this.Comment = Comment;
        this.Switch = Switch;
    }
    return Game;
}());
exports.Game = Game;
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["Inactive"] = 0] = "Inactive";
    GameStatus[GameStatus["ActiveForBetting"] = 1] = "ActiveForBetting";
    GameStatus[GameStatus["Blocked"] = 2] = "Blocked";
    GameStatus[GameStatus["Canceled"] = 3] = "Canceled";
    GameStatus[GameStatus["Started"] = 6] = "Started";
    GameStatus[GameStatus["ProcessingResults"] = 7] = "ProcessingResults";
    GameStatus[GameStatus["Finished"] = 8] = "Finished";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
//# sourceMappingURL=game.js.map