import { type Feature, type NavLink, type Step, type Testimonial, type Benefit } from '../types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export const FEATURES: Feature[] = [
  {
    id: 'live-streaming',
    title: 'Live Streaming Donations',
    description: 'Broadcast directly from disaster sites and receive crypto tips in real-time via secure smart contracts.',
    iconName: 'video'
  },
  {
    id: 'video-reels',
    title: 'Video Reels Pitching',
    description: 'Upload short, impactful videos to showcase immediate needs and attract global community support.',
    iconName: 'film'
  },
  {
    id: 'location-tracking',
    title: 'Location Tracking',
    description: 'Use interactive maps to coordinate aid efforts with real-time user tracking for efficient response.',
    iconName: 'map-pin'
  },
  {
    id: 'transparent-funding',
    title: 'Transparent Funding',
    description: 'All donations are recorded on the Base blockchain, ensuring 100% verifiable impact and trust.',
    iconName: 'shield-check'
  },
];

export const STEPS: Step[] = [
  {
    id: 1,
    title: 'Sign up with Wallet',
    description: 'Connect your crypto wallet securely to start your journey as a donor or a relief seeker.'
  },
  {
    id: 2,
    title: 'Post Reel or Go Live',
    description: 'Share the reality on the ground. Go live or upload a reel to explain the urgent needs.'
  },
  {
    id: 3,
    title: 'Viewers Donate Instantly',
    description: 'Global viewers can send ETH or stablecoins instantly while watching your content.'
  },
  {
    id: 4,
    title: 'Track Progress',
    description: 'See donations come in real-time and track aid distribution on our interactive map.'
  },
  {
    id: 5,
    title: 'Funds Disbursed',
    description: 'Smart contracts ensure funds are released transparently to the intended recipients.'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote: "AidBeacon helped us rebuild our community center after the floods. The real-time donations were a lifeline when traditional banking was down.",
    author: "Elena Rodriguez",
    role: "Community Organizer"
  },
  {
    id: 't2',
    quote: "The transparency of the blockchain tracking gave our donors confidence that their money was actually buying supplies.",
    author: "Markus Thomsen",
    role: "Disaster Response Lead"
  }
];

export const BENEFITS: Benefit[] = [
  { id: 'b1', text: 'Fast, borderless micro-donations' },
  { id: 'b2', text: 'Decentralized transparency & accountability' },
  { id: 'b3', text: 'Mobile-first design for field use' },
  { id: 'b4', text: 'Community-driven relief coordination' },
  { id: 'b5', text: 'Low transaction fees on Base' },
];
