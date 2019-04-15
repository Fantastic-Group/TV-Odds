"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var groupby_pipe_1 = require("../pipes/groupby.pipe");
var PropBetColumn = /** @class */ (function () {
    function PropBetColumn(columnNumber) {
        this.columnNumber = columnNumber;
        this.games = [];
        this.groupBy = new groupby_pipe_1.GroupByPipe();
    }
    PropBetColumn.prototype.totalBets = function () {
        return this.games.map(function (g) { return g.bets.length; }).reduce(function (total, number) { return total + number; }, 0);
    };
    PropBetColumn.prototype.availableBetsForColumn = function (defaultMaxBets) {
        return defaultMaxBets - (this.games.length + 1) - this.totalBets() - this.getTotalBetTypes();
    };
    PropBetColumn.prototype.getTotalBetTypes = function () {
        var _this = this;
        var totalBetTypes = 1;
        this.games.forEach(function (g) {
            var groupedBetTypes = _this.groupBy.transform(g.bets, "BetTypeID");
            totalBetTypes += groupedBetTypes == null ? 0 : groupedBetTypes.length;
        });
        return totalBetTypes;
    };
    return PropBetColumn;
}());
exports.PropBetColumn = PropBetColumn;
//# sourceMappingURL=prop-bet-column.js.map