import { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE } from '../utils/api';

/**
 * ServerWakeUpContext
 * -------------------
 * Pings /api/health on app load to detect Render cold-starts.
 * While the backend is waking up, `isWakingUp` is true and
 * `elapsedSeconds` counts up so the UI can show a live timer.
 */
const ServerWakeUpContext = createContext({ isWakingUp: false, elapsedSeconds: 0 });

export const useServerWakeUp = () => useContext(ServerWakeUpContext);

const HEALTH_URL = `${API_BASE}/api/health`;
const FAST_THRESHOLD_MS = 4000; // If backend responds within 4s, no overlay shown

export default function ServerWakeUpProvider({ children }) {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let timerInterval = null;
    let cancelled = false;

    const startTime = Date.now();
    let slowStartTimeout = null;

    const ping = async () => {
      // Give it FAST_THRESHOLD_MS before showing the overlay
      slowStartTimeout = setTimeout(() => {
        if (!cancelled) {
          setIsWakingUp(true);
          // Start counting seconds
          timerInterval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
          }, 1000);
        }
      }, FAST_THRESHOLD_MS);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120_000); // 2 min max
        await fetch(HEALTH_URL, { signal: controller.signal });
        clearTimeout(timeoutId);
      } catch {
        // Ignore errors — backend may take time but will eventually respond
      } finally {
        if (!cancelled) {
          clearTimeout(slowStartTimeout);
          clearInterval(timerInterval);
          setIsWakingUp(false);
          setIsDone(true);
        }
      }
    };

    ping();

    return () => {
      cancelled = true;
      clearTimeout(slowStartTimeout);
      clearInterval(timerInterval);
    };
  }, []);

  return (
    <ServerWakeUpContext.Provider value={{ isWakingUp, elapsedSeconds, isDone }}>
      {children}
      {isWakingUp && <WakeUpOverlay elapsedSeconds={elapsedSeconds} />}
    </ServerWakeUpContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Beautiful Wake-Up Overlay                                                  */
/* -------------------------------------------------------------------------- */
function WakeUpOverlay({ elapsedSeconds }) {
  // Progress: animate from 0% towards ~90% over 90 seconds (never hits 100 until done)
  const progress = Math.min(90, (elapsedSeconds / 90) * 90);

  const tips = [
    'Your data is safe and secure ✨',
    'The free server is warming up ☕',
    'This only happens after long idle times 💤',
    'Next visit will be much faster ⚡',
    'Almost there — thanks for your patience 🙏',
  ];
  const tipIndex = Math.floor(elapsedSeconds / 8) % tips.length;

  return (
    <div className="wake-overlay">
      {/* Animated background blobs */}
      <div className="wake-blob wake-blob-1" />
      <div className="wake-blob wake-blob-2" />
      <div className="wake-blob wake-blob-3" />

      <div className="wake-card">
        {/* Animated logo / spinner */}
        <div className="wake-spinner-ring">
          <svg className="wake-spinner-svg" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" className="wake-circle-track" />
            <circle cx="40" cy="40" r="34" className="wake-circle-arc" />
          </svg>
          <div className="wake-spinner-icon">☁️</div>
        </div>

        <h2 className="wake-title">Server is Waking Up</h2>
        <p className="wake-subtitle">
          Our free server goes to sleep after inactivity.
          <br />
          It'll be ready in just a moment…
        </p>

        {/* Progress bar */}
        <div className="wake-progress-track">
          <div
            className="wake-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timer */}
        <div className="wake-timer">
          <span className="wake-timer-dot" />
          Waiting {elapsedSeconds}s…
        </div>

        {/* Rotating tip */}
        <div className="wake-tip" key={tipIndex}>
          {tips[tipIndex]}
        </div>
      </div>
    </div>
  );
}
