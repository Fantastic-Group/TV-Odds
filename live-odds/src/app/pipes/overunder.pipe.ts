import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'overunder'
})
export class OverunderPipe implements PipeTransform {

  transform(val: number, showOU: boolean, over:boolean): string {
	  var retVal = val;
	  if (val !== undefined && val !== null) {
		  if (val == 0)
			  return '';
		  if (showOU) {
			  if (over)
				  return 'O ';
			  else
				  return 'U ';
		  }
		  
		  else
			  return retVal.toString();

	  } else {
		  return "";
	  }
  }

}
