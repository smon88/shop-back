import { Component, OnInit, PLATFORM_ID, Inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  isDarkMode = false;
  isMenuOpen = signal(false);
  cartItemsCount = signal(0);
  isScrolled = signal(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check for saved theme preference or system preference
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      this.isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
      this.applyTheme();

      // Add click listener to theme toggle button
      setTimeout(() => {
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());
      });

      // Update cart count
      this.updateCartCount();

      // Listen for storage changes
      window.addEventListener('storage', () => this.updateCartCount());

      // Add scroll listener for navbar effect
      window.addEventListener('scroll', () => {
        this.isScrolled.set(window.scrollY > 10);
      });
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  toggleMenu(): void {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private updateCartCount(): void {
    if (isPlatformBrowser(this.platformId)) {
      const cart = localStorage.getItem('cart');
      if (cart) {
        try {
          const cartData = JSON.parse(cart);
          const count = cartData.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          this.cartItemsCount.set(count);
        } catch (e) {
          this.cartItemsCount.set(0);
        }
      } else {
        this.cartItemsCount.set(0);
      }
    }
  }
}
