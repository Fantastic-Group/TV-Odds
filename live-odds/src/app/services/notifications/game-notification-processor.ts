import { NotificationBase } from "./notification-base";
import { Configuration } from "../../models/configuration";
import { GameNotification, EventNotification } from "../../models/notifications";
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: 'root'
})
export class GameNotificationProcessor extends NotificationBase<GameNotification> {
	protected parse(value: string): GameNotification {
		// Example responses: 1018744*93*2*1 | 1035341*2363*1*0
		var notification = new GameNotification();
		var values = value.split("*");
		notification.gameID = parseInt(values[0]);
		notification.betTypeID = parseInt(values[1]);
		notification.betForecastStatus = parseInt(values[2]);
		notification.isLive = parseInt(values[3]) == 1;

		return notification;
	}
	protected updateConfiguration(response: GameNotification, config: Configuration): Configuration {
		var retVal = false;
		return null;
		//var game = this.configurationService.findmygame(response.gameID, config);
		//if (game != null) {
		//	//var modifiedBets = game.bets.filter(b => b.BetTypeID == response.betTypeID);

		//	for (var i = 0; i < game.bets.length; i++) {
		//		var bet = game.bets[i];
		//		if (bet.BetTypeID == response.betTypeID) {
		//			bet.Bet_ISLIVE = response.isLive;
		//			bet.BetForecastStatus = response.betForecastStatus;
		//			return config;
		//		}
		//	}
			
			
		//}

		//return null;

		
	}
}