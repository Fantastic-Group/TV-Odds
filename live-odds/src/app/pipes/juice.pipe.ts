import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';



@Pipe({
  name: 'juice'
})
export class JuicePipe extends DecimalPipe implements PipeTransform {

	transform(val: number): string {
		var retVal = super.transform(val, '1.0-0');
		if (val !== undefined && val !== null) {
			
			if (val == 100)
				return 'EVEN';
			if (val > 0)
				return '+' + retVal;
			else if (val < 0)
				return retVal;
			else
				return '';

		} else {
			return "";
		}
	}

}
