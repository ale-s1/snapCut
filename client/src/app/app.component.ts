import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, of, retry, Subject, takeUntil } from 'rxjs';
import { GiftService } from './core/services/gift.service';
import { VideoPlayerService } from './core/services/video-player.service';
import { SideMenuComponent } from './shared/components/side-menu/desktop/side-menu/side-menu.component';
import { TimeLineComponent } from './shared/components/time-line/time-line.component';
import { VideoPlayerComponent } from './shared/components/video-player/video-player.component';
import { DIR_LOCAL_GIFT } from './shared/constants/const';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    SideMenuComponent,
    TimeLineComponent,
    VideoPlayerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'snapCut';
  private destroy$ = new Subject<void>();

  public loading: boolean = false;
  public gifUrl: string = '';

  constructor(
    private videoPlayerService: VideoPlayerService,
    private giftService: GiftService
  ) {}

  private getRandomGift(): void {
    this.giftService
      .getRandomGift('', true)
      .pipe(
        retry(2),
        catchError(() => of(DIR_LOCAL_GIFT)),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => (this.gifUrl = res));
  }

  handleSubscriptions() {
    this.videoPlayerService
      .getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.loading = state.isFileSelected;
      });
  }

  ngOnInit(): void {
    this.getRandomGift();
    this.handleSubscriptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.videoPlayerService.destroy();
  }
}
