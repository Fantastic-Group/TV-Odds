import { NotificationBase } from "./notification-base";
import { StatNotification } from "../../models/notifications";
import { Configuration } from "../../models/configuration";
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: 'root'
})
export class StatNotificationProcessor extends NotificationBase<StatNotification> {
	protected parse(value: string): StatNotification {
		return new StatNotification();
	}

	protected updateConfiguration(response: StatNotification, config: Configuration): Configuration {
		var retVal = false;

		//config.oddsDisplays.forEach(o => {
		//	o.sports.forEach(s => {
		//		s.leagues.forEach(l => {					
		//				// TODO: Figure out what the fields being returned are and... do something with them
		//		});
		//	});
		//});

		return null;
	}
}
