// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// ng serve --configuration=azure --source-map

export const environment = {
	production: false,
	casino:"mardigras",
	//apiServerUrl: "http://demo.entergaming.im:8080/root/",
	apiServerUrl: "http://23.96.16.92:5015/root/",
	timezone: "-05:00",
	websocketServerUrl: "http://40.117.184.170:5010/signalr"
};



/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
