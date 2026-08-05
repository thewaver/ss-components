import './keyframes.css';
import './keyframes-alt.css';

export const AnimNames = {
  Bubble: {
    Default: 'bubble'
  },

  Encircle: {
    Clockwise: 'encircle-cw',
    Counterclockwise: 'encircle-ccw'
  },
  
  ZoomIn: {
    Default: 'zoom-in'
  },

  ZoomOut: {
    Default: 'zoom-out'
  },

  FadeIn: {
    Linear: 'fade-in-linear',
    Flicker: 'fade-in-flicker',
    Flash: 'fade-in-flash'
  },

  Blur: {
    Default: 'blur'
  },

  Bounce: {
    Default: 'bounce'
  },

  Skew: {
    Clockwise: 'skew-cw',
    Counterclockwise: 'skew-ccw'
  },

  Pull: {
    Horizontal: 'pull-horizontal',
    Vertical: 'pull-vertical',
    Down: 'pull-down',
    Left: 'pull-left',
    Up: 'pull-up',
    Right: 'pull-right'
  },

  Pop: {
    Center: 'pop-center',
    TopLeft: 'pop-top-left',
    TopRight: 'pop-top-right',
    BottomRight: 'pop-bottom-right',
    BottomLeft: 'pop-bottom-left'
  },

  Hinge: {
    Top: 'hinge-top',
    Right: 'hinge-right',
    Bottom: 'hinge-bottom',
    Left: 'hinge-left'
  },

  Carousel: {
    Top: 'carousel-top',
    Right: 'carousel-right',
    Bottom: 'carousel-bottom',
    Left: 'carousel-left'
  },

  ShakeDown: {
    Default: 'shake-down'
  },

  Drip: {
    Default: 'drip'
  },

  Elastic: {
    Down: 'elastic-down',
    Left: 'elastic-left',
    Up: 'elastic-up',
    Right: 'elastic-right'
  },

  ShootUp: {
    Default: 'shoot-up'
  },

  Roll: {
    DownLeft: 'roll-down-left',
    DownRight: 'roll-down-right',
    UpLeft: 'roll-up-left',
    UpRight: 'roll-up-right'
  },

  Tumble: {
    Right: 'tumble-right',
    Left: 'tumble-left'
  },

  Hop: {
    Right: 'hop-right',
    Left: 'hop-left'
  },

  Spin: {
    UpClockwise: 'spin-up-cw',
    UpCounterclockwise: 'spin-up-ccw',
    DownClockwise: 'spin-down-cw',
    DownCounterclockwise: 'spin-down-ccw'
  },

  Swarm: {
    Clockwise: 'swarm-cw',
    Counterclockwise: 'swarm-ccw'
  },
}

export const TimingFunc = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out"
];
