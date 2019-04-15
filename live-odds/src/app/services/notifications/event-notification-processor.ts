import { NotificationBase } from "./notification-base";
import { Configuration } from "../../models/configuration";
import { EventNotification } from "../../models/notifications";
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: 'root'
})
export class EventNotificationProcessor extends NotificationBase<EventNotification> {
	protected parse(value: string): EventNotification {
		var values = value.split("*");
		var result = new EventNotification();
		result.gameID = parseInt(values[0]);
		result.status = parseInt(values[1]);

		return result;
	}

	protected updateConfiguration(response: EventNotification, config: Configuration): Configuration {
		var retVal = false;
		//console.log('event notification message updateconfig');
		var game = this.configurationService.findmygame(response.gameID, config);
		if (game != null && game.game.STATUS != response.status) {

			game.game.STATUS = response.status;

			return config;
		}

		return null;
	}
}