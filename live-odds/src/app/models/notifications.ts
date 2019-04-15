import { GameStatus } from "./game";

export class BetNotification {
	public gameID: number;
	public betTypeID: number;
	public betForecastCode: number;
	public betforecastParam: number;
	public betForecastOdds: number;
}

export class GameNotification {
	public gameID: number;
	public betTypeID: number;
	public betForecastStatus: number;
	public isLive: boolean;
}

export class EventNotification {
	public gameID: number;
	public status: GameStatus;
}

export class StatNotification {

}