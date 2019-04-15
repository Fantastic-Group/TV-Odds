import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dontShowTheseProps'
})
export class DontShowThesePropsPipe implements PipeTransform {

	transform(items: any[]): any {
		if (!items ) {
			return items;
		}
		// filter items array, items which match and return true will be
		// kept, false will be filtered out
		return items.filter(item => item.BetForecastOdds !== 0);
    
  }

}
