import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';
import { timer } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LiveUpdateService {

	private hubUrl: string = environment.websocketServerUrl;
	private hubConnection: SignalR.Hub.Connection;
	private timeoutDefault: number = 1;

	constructor(private notificationService: NotificationService) {
	}

	/**
	 * Initializes a connection to a signalr hub for a specific gameID
	 * @param gameID The gameID to listen to updates for. Use -1 to listen for all games
	 */
	public initialize(gameID: number): void {
		this.connect(gameID, this.timeoutDefault);
	}

	/** Disconnects the signalr service if it is currenctly connected. */
	public disconnect(): void {
		if (this.hubConnection != null && this.hubConnection.state != SignalR.ConnectionState.Disconnected)
			this.hubConnection.stop();
	}

	/**
	 * Starts a connection to the hub. If unable to connect, re-attempt to connect based on the timeout (in seconds) specified. An exponential fallback will
	 * be performed until it has reached 1 minute, after which 1 minute will be used until it connects.
	 * @param gameID The gameID to listen to updates for. Use -1 to listen for all games
	 * @param timeout the number of seconds (up to 60) to wait before attempt to connect after a failed connection
	 */
	private connect(gameID: number, timeout: number) {
		if ($ && $.hubConnection) {
			this.hubConnection = $.hubConnection();
		}

		if (this.hubUrl != null) {
			this.hubConnection.url = this.hubUrl;
		}

		//this.hubConnection.qs = { "ROOMNAME": gameID > 0 ? gameID : "ALL" };
		this.hubConnection.qs = { "ROOMNAME": "ALL" };
		this.addListeners();

		this.hubConnection.logging = false; //logging purposes

		return this.hubConnection.start()
			.fail(reason => {
				timer(timeout * 1000).subscribe(x => {
					var timerStep = timeout >= 60 ? 60 : timeout * 2;
					this.connect(gameID, timerStep);
				});
			});
	}

	/** Attaches hub proxies to the hub for EG's various hubs */
	private addListeners(): void {
		var proxy = this.hubConnection.createHubProxy('lBHub');

		// parse the notifications do whatever code to update odds in the GUI
		proxy.on('updateOdds', (notification: string) => {
			this.notificationService.processBetNotification(notification);
		});

		// parse the notifications do whatever code to update markets in the GUI 
		proxy.on('updateGames', (notification: any) => {
			this.notificationService.processGameNotification(notification);
		});

		// parse the notifications do whatever code to update events in the GUI 
		proxy.on('updateEvents', (notification: any) => {
			this.notificationService.processEventNotification(notification);
		});

		// parse the notifications do whatever code to update scores in the GUI  (if not scorebox graphic is included)
		proxy.on('updateStatistics', (notification: any) => {
			this.notificationService.processStatNotification(notification);
		});
	}
}