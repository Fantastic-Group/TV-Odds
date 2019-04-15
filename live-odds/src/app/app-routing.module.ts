import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LiveOddsComponent } from 'src/app/views/live-odds/live-odds.component';
import { ConfigurationComponent } from './views/configuration/configuration.component';

const appRoutes: Routes = [
	{
		path: "",
		redirectTo: "/config",
		pathMatch: "full"
	},
	{
		path: "display",
		component: LiveOddsComponent,
		data: { title: "Odds" }
	},
	{
		path: "config",
		component: ConfigurationComponent,
		data: { title: "Site Configuration" }
	}
];

@NgModule({
  imports: [
	  CommonModule,
	  RouterModule.forRoot(appRoutes, { useHash: true } ),
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
