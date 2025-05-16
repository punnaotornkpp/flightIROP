import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionDestroyer implements OnDestroy {
  private subscription: Subscription = new Subscription();
  private interval!: ReturnType<typeof setTimeout>;

  public AddSubscription(subscription: Subscription): void {
    if (subscription !== null) {
      this.subscription.add(subscription);
    }
  }

  public AddInterval(interval: ReturnType<typeof setTimeout>): void {
    if (interval !== null) {
      this.interval = interval;
    }
  }

  public removeInterval() {
    if (this.interval != null) {
      clearInterval(this.interval);
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    clearInterval(this.interval);
  }
}
