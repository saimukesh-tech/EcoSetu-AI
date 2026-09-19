import type { ReactNode } from 'react';
import { LayoutDashboard, Calendar, Sparkles, Handshake, Truck, MessageCircle, BarChart2, Settings } from 'lucide-react';
import { createElement } from 'react';

export interface NavItem {
  to: string;
  icon: ReactNode;
  label: string;
  mobileLabel?: string;
}

export const organizerNav: NavItem[] = [
  { to: '/dashboard', icon: createElement(LayoutDashboard, { size: 18 }), label: 'Overview', mobileLabel: 'Home' },
  { to: '/events', icon: createElement(Calendar, { size: 18 }), label: 'My Events', mobileLabel: 'Events' },
  { to: '/predict', icon: createElement(Sparkles, { size: 18 }), label: 'Waste Prediction', mobileLabel: 'Predict' },
  { to: '/partners', icon: createElement(Handshake, { size: 18 }), label: 'Recovery Partners', mobileLabel: 'Partners' },
  { to: '/pickups', icon: createElement(Truck, { size: 18 }), label: 'Pickup Requests', mobileLabel: 'Pickups' },
  { to: '/impact', icon: createElement(BarChart2, { size: 18 }), label: 'Impact', mobileLabel: 'Impact' },
  { to: '/assistant', icon: createElement(MessageCircle, { size: 18 }), label: 'AI Assistant', mobileLabel: 'Assistant' },
];

export const partnerNav: NavItem[] = [
  { to: '/partner-dashboard', icon: createElement(LayoutDashboard, { size: 18 }), label: 'Overview', mobileLabel: 'Home' },
  { to: '/partner-pickups', icon: createElement(Truck, { size: 18 }), label: 'Pickup Requests', mobileLabel: 'Pickups' },
  { to: '/impact', icon: createElement(BarChart2, { size: 18 }), label: 'Impact', mobileLabel: 'Impact' },
  { to: '/assistant', icon: createElement(MessageCircle, { size: 18 }), label: 'AI Assistant', mobileLabel: 'Assistant' },
];

/** Mobile bottom nav shows a curated 5-item subset per role — secondary items live in the drawer. */
export const organizerMobileNav: NavItem[] = [
  organizerNav[0], organizerNav[1], organizerNav[2], organizerNav[3], organizerNav[5],
];
export const partnerMobileNav: NavItem[] = partnerNav;

export const settingsNav: NavItem = { to: '/settings', icon: createElement(Settings, { size: 18 }), label: 'Settings' };
