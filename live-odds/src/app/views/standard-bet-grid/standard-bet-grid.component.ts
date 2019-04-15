import { Component, OnInit, Input } from '@angular/core';
import { SelectedLeague } from '../../models/configuration';
import { StartupService } from '../../services/startup.service';
import { Game, GameStatus } from '../../models/game';
import { Bet } from '../../models/bet';
import { BetType } from '../../models/sportsettings';
import { Sport } from '../../models/sport';
import { League } from '../../models/league';
import { NoCommaPipe } from '../../pipes/no-comma.pipe';
import { JuicePipe } from '../../pipes/juice.pipe';
import { MoneylinePipe } from '../../pipes/moneyline.pipe';
import { OddsPipe } from '../../pipes/odds.pipe';
import { OverunderPipe } from '../../pipes/overunder.pipe';

@Component({
	selector: 'app-standard-bet-grid',
	templateUrl: './standard-bet-grid.component.html',
	styleUrls: ['./standard-bet-grid.component.scss']
})
export class StandardBetGridComponent implements OnInit {

	@Input() sport: Sport;
	@Input() league: SelectedLeague;
	@Input() games: Game[];
	@Input() showHeader: boolean;
	@Input() vertical: boolean;
	@Input() hideJuice: boolean;
	@Input() gameIsLive: boolean;

	public BetType = BetType;

	constructor(private sportSettings: StartupService) { }

	ngOnInit() {
	}

	public hasGameTimeChanged(game: Game) {
		return game.ScheduledDate != game.ActualDate;
	}

	public getGameStatus(gamestatus: number, brstatus: number, league?: any, sport?: number) {
		if (gamestatus == GameStatus.Finished)
			return 'FINAL';

		if (brstatus) {
			var display = this.sportSettings.getGameStatus().filter(status => brstatus == status.ID);
			if (display.length != 1)
				return '';

			else {
				//IF COLLEGE BASKETBALL OR COLLEGE FOOTBALL AND GAME IS ACTIVE JUST SAY "IN PLAY" (WE DO NOT HAVE LIVE DATA FOR THESE)
				if ((league.league.LeagueName == "COLLEGE FOOTBALL" || league.league.LeagueName == "COLLEGE BASKETBALL") && gamestatus > 1) {
					return 'IN PLAY';
				}

				switch (sport) {
					//baseball
					case 3: {
						//'OT'
						switch (brstatus) {
							case 40: {
								return 'EXTRA INNINGS';
							}
						}
					}
				}

				return display[0].Display;
			}
		}
		if ( gamestatus > 1) {
			return 'IN PLAY';
		}

	}

	/**
	 * Returns the comment text from the game's comment field based on a given prefix. A blank string is returned if a match is not found. The comment should match the format field:value
	 * @param game The game to parse
	 * @param field The field in the comments to process
	 */
	public getTextFromComment(game: Game, field: string): string {

		//console.log('comment', game.Comment);
		var gameComment = game.Comment;
		var comments;
		if (gameComment == null)
			gameComment = "/";
		if (gameComment.indexOf('/') == -1)
			gameComment += "/";
		
		comments = gameComment.split("/");
		for (var i = 0; i < comments.length; i++) {
			if (comments[i] != null && comments[i].toLowerCase().startsWith(field)) {
				var comment = comments[i].split(":");
				console.log(comment.length == 2 ? comment[1].trim() : "");
				return comment[1].trim();
			}
		}

		return '';
	}

	protected getLine(game: Game, isHomeTeam: boolean, getDrawBet: boolean): Bet {
		if (game.Switch) isHomeTeam = !isHomeTeam;
		var selectedGame = this.league.selectedGames.find(g => g.game == game);
		return this.sportSettings.getBetByType(BetType.MoneyLine, this.sport, selectedGame.bets, isHomeTeam, getDrawBet);
	}

	protected getOverUnder(game: Game, isHomeTeam: boolean): Bet {
		if (game.Switch) isHomeTeam = !isHomeTeam;
		var selectedGame = this.league.selectedGames.find(g => g.game == game);
		return this.sportSettings.getBetByType(BetType.OverUnder, this.sport, selectedGame.bets, isHomeTeam);
	}

	protected getSpread(game: Game, isHomeTeam: boolean): Bet {
		if (game.Switch) isHomeTeam = !isHomeTeam;
		var selectedGame = this.league.selectedGames.find(g => g.game == game);
		return this.sportSettings.getBetByType(BetType.Spread, this.sport, selectedGame.bets, isHomeTeam);
	}

	protected fraction(juice: number): string {
		if (juice > 0)
			return reduce(juice, 100);
		else if (juice < 0)
			return reduce(100, juice);
		else
			return "";

	}

}

// Reduce a fraction by finding the Greatest Common Divisor and dividing by it.


function reduce(numerator, denominator): string {
	var gcd = function gcd(a, b) {
		return b ? gcd(b, a % b) : a;
	};
	var gcd2 = gcd(numerator, denominator);
	return ((numerator / gcd2) + "/" + (denominator / gcd2));
}