import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from './shared/components/side-menu/desktop/side-menu/side-menu.component';
import { TimeLineComponent } from './shared/components/time-line/time-line.component';
import { VideoPlayerComponent } from './shared/components/video-player/video-player.component';

export const DEFAULT_VIDEO_HEIGHT = 622;
export const DEFAULT_ASPECT_RATIO = '16:9';

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
export class AppComponent {
  title = 'snapCut';
}
