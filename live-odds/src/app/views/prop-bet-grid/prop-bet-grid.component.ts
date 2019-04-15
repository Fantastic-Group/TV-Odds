import { Component, OnInit, Input } from '@angular/core';
import { SelectedLeague, SelectedGame } from '../../models/configuration';
import { Game } from '../../models/game';
import { Bet } from '../../models/bet';
import { StartupService } from '../../services/startup.service';
import { Sport } from '../../models/sport';
import { DontShowThesePropsPipe } from '../../pipes/dont-show-these-props.pipe';

@Component({
	selector: 'app-prop-bet-grid',
	templateUrl: './prop-bet-grid.component.html',
	styleUrls: ['./prop-bet-grid.component.scss']
})
export class PropBetGridComponent implements OnInit {
	@Input() sport: Sport;
	@Input() games: SelectedGame[];
	@Input() league: SelectedLeague;
	@Input() vertical: boolean;
	@Input() futures: boolean;
	@Input() hd: boolean;

	constructor(private sportSettings: StartupService) { }

	ngOnInit() {
	}

	/**
	 * Returns updated prop bet name replacing references to home/away teams with the actual team names.
	 * @param betName The description of the bet.
	 * @param game The game associated with the bet.
	 */
	public getBetName(betName: string, game: Game): string {
		return betName
			.toUpperCase()
			.replace("AWAYTEAM", game.AwayTeamName)
			.replace("HOMETEAM", game.HomeTeamName)
			.replace("AWAY TEAM", game.AwayTeamName)
			.replace("HOME TEAM", game.HomeTeamName)
			.toUpperCase();
	}

	/**
	 * Returns updated bet description replacing references to home/away teams with the actual team names.
	 * @param bet The bet to process.
	 * @param game The game associated with the bet.
	 */
	public getBetDescription(bet: Bet, game: Game, betName: string): string {
		//console.log('betname', betName);
		var description = bet.BetForecastDescriptionEnglish
			.replace("2H", game.AwayTeamName)
			.replace("1H", game.HomeTeamName)
			.replace("1orX", game.HomeTeamName + " or Draw")
			.replace("1or2", game.HomeTeamName + " or " + game.AwayTeamName)
			.replace("Xor2", "Draw or " + game.AwayTeamName);

		if (description == "1")
			description = game.HomeTeamName;

		if (description == "2")
			description = game.AwayTeamName;

		if (description.toUpperCase() == "X")
			description = "Draw";

		if (description.toUpperCase() == "UNDER" || description.toUpperCase() == "OVER")
			description += " " + bet.BetForecast_PARAM;
		else if (betName !== undefined && (betName.toUpperCase().indexOf('PT SPREAD') > -1 || betName.toUpperCase().indexOf('SPREAD') > -1)) {
			description += " " + (bet.BetForecast_PARAM > 0 ? "+" + bet.BetForecast_PARAM : bet.BetForecast_PARAM);
		}

		return description;
	}

	protected getPropBets(game: SelectedGame): Array<Bet> {
		return this.sportSettings.getPropBets(this.sport, game.bets);
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

function reduce(numerator, denominator): string {
	var gcd = function gcd(a, b) {
		return b ? gcd(b, a % b) : a;
	};
	var gcd2 = gcd(numerator, denominator);
	return ((numerator / gcd2) + "/" + (denominator / gcd2)).replace("-", "");
}