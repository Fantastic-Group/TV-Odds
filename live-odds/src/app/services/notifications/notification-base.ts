import { INotification } from "./INotification";
import { ConfigurationService } from "../configuration.service";
import { Configuration } from "../../models/configuration";
import { Injectable } from "@angular/core";

@Injectable({
	providedIn: 'root'
})
export abstract class NotificationBase<T> implements INotification {
	constructor(public configurationService: ConfigurationService) {
	}

	/**
	 * Processes a value returned via websockets and saves any changes as an update in storage.
	 * @param value
	 */
	public process(value: string) {
		var config = this.configurationService.loadUpdateFromStorage();


		if (config != null) {
			var model = this.parse(value);
			var updated = this.updateConfiguration(model, config);

			if (updated)
				this.configurationService.saveUpdateToStorage(config);
		}
	}

	/**
	 * Parses the string returned via websockets to get the values returned from the server
	 * @param value the string of data returned via the websocket message
	 */
	protected abstract parse(value: string) : T;

	/**
	 * Performs any updates to the configuration and returns if the config was updated.
	 * @param response The value received from the websocket update
	 * @param config The config values to update
	 */
	protected abstract updateConfiguration(response: T, config: Configuration): Configuration;
}