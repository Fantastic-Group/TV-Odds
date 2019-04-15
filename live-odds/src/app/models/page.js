"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("./configuration");
var Page = /** @class */ (function () {
    function Page(orientation, maxGamesPerPage, columns, maxPropsPerPage, maxFuturesPerPage) {
        this.orientation = orientation;
        this.maxGamesPerPage = maxGamesPerPage;
        this.columns = columns;
        this.maxPropsPerPage = maxPropsPerPage;
        this.maxFuturesPerPage = maxFuturesPerPage;
    }
    return Page;
}());
exports.Page = Page;
var HorizontalPage = /** @class */ (function (_super) {
    __extends(HorizontalPage, _super);
    function HorizontalPage() {
        return _super.call(this, configuration_1.Orientation.Horizontal, 12, 2, 18, 24) || this;
    }
    return HorizontalPage;
}(Page));
exports.HorizontalPage = HorizontalPage;
var VerticalPage = /** @class */ (function (_super) {
    __extends(VerticalPage, _super);
    function VerticalPage() {
        return _super.call(this, configuration_1.Orientation.Vertical, 12, 1, 25, 24) || this;
    }
    return VerticalPage;
}(Page));
exports.VerticalPage = VerticalPage;
var PageFactory = /** @class */ (function () {
    function PageFactory() {
    }
    PageFactory.getPage = function (orientation) {
        if (orientation == configuration_1.Orientation.Horizontal)
            return new HorizontalPage();
        else
            return new VerticalPage();
    };
    return PageFactory;
}());
exports.PageFactory = PageFactory;
//# sourceMappingURL=page.js.map