import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Register the GSAP plugins used across the application. */
export function setupGsap() {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
