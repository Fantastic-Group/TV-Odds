import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { BetNotificationProcessor } from './notifications/bet-notification-processor';
import { GameNotificationProcessor } from './notifications/game-notification-processor';
import { EventNotificationProcessor } from './notifications/event-notification-processor';
import { StatNotificationProcessor } from './notifications/stat-notification-processor';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

	constructor(
		private betNotificationProcessor: BetNotificationProcessor,
		private gameNotificationProcessor: GameNotificationProcessor,
		private eventNotificationProcessor: EventNotificationProcessor,
		private statNotificationProcessor: StatNotificationProcessor) { }

	public processBetNotification(value: string): void {
		this.betNotificationProcessor.process(value);
	}

	public processGameNotification(value: string): void {
		this.gameNotificationProcessor.process(value);
	}

	public processStatNotification(value: string) : void {
		this.statNotificationProcessor.process(value);
	}

	public processEventNotification(value: string): void {
		this.eventNotificationProcessor.process(value);
	}
}
