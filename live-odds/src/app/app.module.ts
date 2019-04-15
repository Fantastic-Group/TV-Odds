import { HttpClientModule } from '@angular/common/http';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { LiveOddsComponent } from 'src/app/views/live-odds/live-odds.component';
import { AppRoutingModule } from './/app-routing.module';
import { AppComponent } from './views/app/app.component';
import { ConfigurationComponent } from './views/configuration/configuration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StartupService } from './services/startup.service';
import { GroupByPipe } from './pipes/groupby.pipe';
import { PropBetGridComponent } from './views/prop-bet-grid/prop-bet-grid.component';
import { StandardBetGridComponent } from './views/standard-bet-grid/standard-bet-grid.component';
import { SpinnerComponent } from './views/spinner/spinner.component';
import { NoCommaPipe } from './pipes/no-comma.pipe';
import { JuicePipe } from './pipes/juice.pipe';
import { MoneylinePipe } from './pipes/moneyline.pipe';
import { OddsPipe } from './pipes/odds.pipe';
import { DontShowThesePropsPipe } from './pipes/dont-show-these-props.pipe';
import { OverunderPipe } from './pipes/overunder.pipe';

@NgModule({
	declarations: [
		AppComponent,
		LiveOddsComponent,
		ConfigurationComponent,
		GroupByPipe,
		PropBetGridComponent,
		StandardBetGridComponent,
		SpinnerComponent,
		NoCommaPipe,
		JuicePipe,
		MoneylinePipe,
		OddsPipe,
		DontShowThesePropsPipe,
		OverunderPipe
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule 
	],
	providers: [Title, {
		provide: APP_INITIALIZER, useFactory: (startup: StartupService) => () => startup.load(), deps: [StartupService], multi: true
	}],
	bootstrap: [AppComponent]
})
export class AppModule { }