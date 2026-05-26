import * as React from 'react';
import { Button } from '@/components/ui/button';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4';
const navItems = ['About us', 'Reach us'];

type LandingPageProps = {
  onBegin: () => void;
};

export function LandingPage({ onBegin }: LandingPageProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    let frameId = 0;
    let endedTimer: number | undefined;

    if (!video) {
      return undefined;
    }

    const activeVideo = video;

    function setOpacity(value: number) {
      activeVideo.style.opacity = String(Math.max(0, Math.min(1, value)));
    }

    function monitorVideo() {
      if (activeVideo.duration && Number.isFinite(activeVideo.duration)) {
        const remaining = activeVideo.duration - activeVideo.currentTime;

        if (activeVideo.currentTime < 0.5) {
          setOpacity(activeVideo.currentTime / 0.5);
        } else if (remaining < 0.5) {
          setOpacity(remaining / 0.5);
        } else {
          setOpacity(1);
        }
      }

      frameId = requestAnimationFrame(monitorVideo);
    }

    function restartVideo() {
      setOpacity(0);
      endedTimer = window.setTimeout(() => {
        activeVideo.currentTime = 0;
        void activeVideo.play();
      }, 100);
    }

    setOpacity(0);
    void activeVideo.play();
    activeVideo.addEventListener('ended', restartVideo);
    frameId = requestAnimationFrame(monitorVideo);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(endedTimer);
      activeVideo.removeEventListener('ended', restartVideo);
    };
  }, []);

  return (
    <main className="relative h-screen min-h-screen w-full overflow-hidden bg-white text-black">
      <video
        autoPlay
        className="absolute z-0 h-[calc(100%-300px)] w-full object-cover transition-opacity duration-100"
        loop={false}
        muted
        playsInline
        ref={videoRef}
        src={VIDEO_URL}
        style={{ inset: 'auto 0 0 0', top: '300px' }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white via-transparent to-white" />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 sm:px-8 sm:py-6">
        <button
          className="leading-none text-black"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3vw, 2.65rem)' }}
          type="button"
        >
          Quizora<sup className="ml-0.5 text-sm">®</sup>
        </button>

        <div className="flex items-center gap-5 sm:gap-8">
          {navItems.map((item) => (
            <button
              className="text-sm font-medium text-[#6F6F6F] transition-colors hover:text-black"
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center justify-center px-6 pb-40 pt-[calc(8rem_-_75px)] text-center">
        <h1
          className="animate-fade-rise max-w-7xl text-[clamp(3rem,9.5vw,7.4rem)] font-bold leading-[1.04] text-black"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Beyond <em className="not-italic text-[#6F6F6F]">silence,</em> we build{' '}
          <em className="not-italic text-[#6F6F6F]">the eternal.</em>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-[#6F6F6F] sm:text-lg">
          Building platforms for brilliant minds, fearless makers, and thoughtful souls. Through
          the noise, we craft digital havens for deep work and pure flows.
        </p>

        <Button
          className="animate-fade-rise-delay-2 mt-12 rounded-full bg-black px-14 py-5 text-base text-white hover:scale-[1.03]"
          onClick={onBegin}
        >
          Begin Journey
        </Button>
      </section>
    </main>
  );
}
