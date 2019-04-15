import { Orientation, SelectedGame } from "./configuration";

export class Page {

	constructor(
		public orientation: Orientation,
		public maxGamesPerPage: number,
		public columns: number,
		public maxPropsPerPage: number,
		public maxFuturesPerPage: number,
	) { }
}

export class HorizontalPage extends Page {
	constructor() {
		super(Orientation.Horizontal,12, 2, 18, 24);
	}
}

export class VerticalPage extends Page {
	constructor() {
		super(Orientation.Vertical, 12, 1, 25, 24);
	}
}

export class PageFactory {
	public static getPage(orientation: Orientation): Page {
		if (orientation == Orientation.Horizontal)
			return new HorizontalPage();
		else
			return new VerticalPage();
	}
}