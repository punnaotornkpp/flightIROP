import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { BadgeModule } from 'primeng/badge';
import { LayoutService } from '../../layout/service/layout.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: '[app-profilesidebar]',
  imports: [ButtonModule, DrawerModule, BadgeModule, CommonModule],
  template: `
    <p-drawer
      [visible]="visible()"
      (onHide)="onDrawerHide()"
      position="right"
      [transitionOptions]="'.3s cubic-bezier(0, 0, 0.2, 1)'"
      styleClass="layout-profile-sidebar w-full sm:w-25rem"
    >
      <div class="flex flex-col mx-auto md:mx-0">
        <div class="text-center mb-6">
          <h2 class="text-lg font-semibold mb-1">Welcome</h2>
          <p class="text-primary font-bold text-xl">
            {{ currentUser?.firstName }} {{ currentUser?.lastName }}
          </p>
        </div>

        <ul class="list-none m-0 p-0">
          <li>
            <a
              class="cursor-pointer flex mb-4 p-4 items-center border border-surface-200 dark:border-surface-700 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150"
            >
              <span>
                <i class="pi pi-user text-xl text-primary"></i>
              </span>
              <div class="ml-4">
                <span class="mb-2 font-semibold">Profile</span>
                <p class="text-surface-500 dark:text-surface-400 m-0 text-sm">
                  {{ currentUser?.firstName }} {{ currentUser?.lastName }}
                </p>
              </div>
            </a>
          </li>
          <li>
            <a
              class="cursor-pointer flex mb-4 p-4 items-center border border-surface-200 dark:border-surface-700 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150"
            >
              <span>
                <i class="pi pi-inbox text-xl text-primary"></i>
              </span>
              <div class="ml-4">
                <span class="mb-2 font-semibold">Email</span>
                <p class="text-surface-500 dark:text-surface-400 m-0 text-sm">
                  {{ currentUser?.email }}
                </p>
              </div>
            </a>
          </li>
          <li>
            <a
              class="cursor-pointer flex mb-4 p-4 items-center border border-surface-200 dark:border-surface-700 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150"
            >
              <span>
                <i class="pi pi-briefcase text-xl text-primary"></i>
              </span>
              <div class="ml-4">
                <span class="mb-2 font-semibold">Job Title</span>
                <p class="text-surface-500 dark:text-surface-400 m-0 text-sm">
                  {{ currentUser?.jobTitle }}
                </p>
              </div>
            </a>
          </li>
          <li>
            <a
              class="cursor-pointer flex mb-4 p-4 items-center border border-surface-200 dark:border-surface-700 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150"
            >
              <span>
                <i class="pi pi-briefcase text-xl text-primary"></i>
              </span>
              <div class="ml-4">
                <span class="mb-2 font-semibold">Department</span>
                <p class="text-surface-500 dark:text-surface-400 m-0 text-sm">
                  {{ currentUser?.department }}
                </p>
              </div>
            </a>
          </li>

          <button
            pButton
            icon="pi pi-power-off"
            label="Sign Out"
            class="w-full p-button-danger p-button-outlined mt-8 !py-4"
            (click)="onLogout()"
          ></button>
        </ul>
      </div>
    </p-drawer>
  `,
})
export class AppProfileSidebar {
  private authService = inject(AuthService);
  private layoutService = inject(LayoutService);

  currentUser = this.authService.getCurrentUser();

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  visible = computed(
    () => this.layoutService.layoutState().profileSidebarVisible
  );

  onDrawerHide() {
    this.layoutService.layoutState.update((state) => ({
      ...state,
      profileSidebarVisible: false,
    }));
  }

  onLogout() {
    this.authService.logout();
    this.onDrawerHide();
    window.location.href = '/login';
  }
}
