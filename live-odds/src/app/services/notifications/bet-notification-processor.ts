import { NotificationBase } from "./notification-base";
import { Configuration } from "../../models/configuration";
import { BetNotification } from "../../models/notifications";
import { ConfigurationService } from "../configuration.service";
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: 'root'
})
export class BetNotificationProcessor extends NotificationBase<BetNotification> {

	protected updateConfiguration(response: BetNotification, config: Configuration) : Configuration {
		var retVal = false;

		//console.log('bet notification message updateconfig'); 
		var game = this.configurationService.findmygame(response.gameID, config);
		//FOR ODDS DISPLAYS DO NOT UPDATE ODDS IF GAME IS IN PROGRESS OR FINAL THIS DATA IS ONLY USEFUL FOR INPLAY
		if (game != null && game.game.STATUS < 6) {


			for (var i = 0; i < game.bets.length; i++) {
				var bet = game.bets[i];
				if (bet.BetTypeID == response.betTypeID && bet.BetForecastCode == response.betForecastCode && (bet.BetForecast_PARAM != response.betforecastParam || bet.BetForecastOdds != response.betForecastOdds)) {
					bet.BetForecast_PARAM = response.betforecastParam;
					bet.BetForecastOdds = response.betForecastOdds;
					return config;
				}
			}

			
		}


		return null;
	}

	protected parse(value: string): BetNotification {
		var response = new BetNotification();
		var bet = value.split("*");
		var someID = bet[0];
		var euroOdds = bet[1];
		response.betforecastParam = parseFloat(bet[2]);
		var someNumber = bet[3];
		response.gameID = parseInt(bet[4]);
		response.betTypeID = parseInt(bet[5]);
		response.betForecastCode = parseInt(bet[6]);
		response.betForecastOdds = parseInt(bet[7]);

		return response;
	}
}