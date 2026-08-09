export type EarthViewKey = 'hero' | 'overview' | 'business' | 'hidden';

export interface EarthViewState {
  rotation: [number, number, number];
  position: [number, number, number];
  scale: number;
  opacity: number;
  markersOpacity: number;
  ringsOpacity: number;
  scrimOpacity: number;
  interactive: boolean;
}

export type EarthTransitionConfig
  = | {
    mode: 'enter';
    duration?: number;
    ease?: string;
  }
  | {
    mode: 'scrub';
    fromView: EarthViewKey;
    start: string;
    end: string;
    scrub?: boolean | number;
    transparentStart?: boolean;
  }
  | {
    mode: 'none';
  };

export interface EarthViewPreset extends EarthViewState {
  mobile?: Partial<EarthViewState>;
  earthTransition?: EarthTransitionConfig;
}

export const earthViewPresets: Record<EarthViewKey, EarthViewPreset> = {
  hero: {
    rotation: [0.18, -1.72, 0],
    position: [0, 0, 0],
    scale: 1,
    opacity: 1,
    markersOpacity: 1,
    ringsOpacity: 0.3,
    scrimOpacity: 0,
    interactive: true
  },
  overview: {
    rotation: [0.18, -1.72, 0],
    position: [0, 0, 0],
    scale: 2.2,
    opacity: 0.3,
    markersOpacity: 0,
    ringsOpacity: 0,
    scrimOpacity: 0.9,
    interactive: false,
    earthTransition: {
      mode: 'enter',
      duration: 0.8,
      ease: 'power2.out'
    },
    // earthTransition: {
    //   mode: 'scrub',
    //   fromView: 'hidden',
    //   start: 'top top',
    //   end: 'bottom 80%',
    //   scrub: true
    // },
    mobile: {
      position: [0.5, 0.36, 0],
      scale: 0.7,
      opacity: 0.24,
      ringsOpacity: 0,
      scrimOpacity: 0.32
    }
  },
  business: {
    rotation: [0.28, -2.18, 0],
    position: [0.88, 0.1, 0],
    scale: 0.76,
    opacity: 1,
    markersOpacity: 0,
    ringsOpacity: 0,
    scrimOpacity: 0,
    interactive: false,
    earthTransition: {
      mode: 'scrub',
      fromView: 'overview',
      start: 'top center',
      end: 'top top',
      scrub: true
    },
    mobile: {
      position: [0.48, 0.4, 0],
      scale: 0.66,
      opacity: 0.2,
      scrimOpacity: 0.36
    }
  },
  hidden: {
    rotation: [0.18, -1.72, 0],
    position: [0, 0, 0],
    scale: 0.72,
    opacity: 0,
    markersOpacity: 0,
    ringsOpacity: 0,
    scrimOpacity: 0.48,
    interactive: false,
    earthTransition: {
      mode: 'enter',
      duration: 0.8,
      ease: 'power2.out'
    },
    mobile: {
      scrimOpacity: 0.56
    }
  }
};

export function resolveEarthViewPreset(view: EarthViewKey, isMobile: boolean): EarthViewState {
  const preset = earthViewPresets[view];

  if (!isMobile || !preset.mobile)
    return preset;

  return {
    ...preset,
    ...preset.mobile
  };
}
