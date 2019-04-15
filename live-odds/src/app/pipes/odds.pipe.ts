import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'odds'
})
export class OddsPipe implements PipeTransform {

	transform(val: number, juice?: number): string {
		var retVal = val;
		if (val !== undefined && val !== null) {
			if (val == 0 && juice !== 0)
				return 'PK';
			if (val > 0)
				return '<span class="symbol plus">+</span>' + retVal;
			else if (val < 0)
				return '<span class="symbol sub">-</span>' + retVal.toString().replace('-','');
			else
				return '';

		} else {
			return "";
		}
	}


}
