"use client";

import { useState } from "react";
import { AlertTriangle, Camera, CircleDot, Maximize2, Mic, MicOff, Pause, Play, SkipBack, SkipForward, Video, Volume2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface CameraChannel {
  id: string; unit: string; driver: string; channel: string; status: "Live" | "Review" | "Offline"; event: string; location: string;
}

const cameras: CameraChannel[] = [
  { id: "1", unit: "B 1234 KJT", driver: "Ahmad Sudirman", channel: "Front", status: "Live", event: "Normal route", location: "Jababeka Gate 2" },
  { id: "2", unit: "B 5678 TGP", driver: "Budi Santoso", channel: "Cabin", status: "Review", event: "Speed alert", location: "Tol Cikampek" },
  { id: "3", unit: "L 3456 ABC", driver: "Dedi Kurniawan", channel: "Front", status: "Live", event: "Loading area", location: "Rungkut Industrial" },
  { id: "4", unit: "H 2345 GHI", driver: "Fajar Ramadhan", channel: "Rear", status: "Offline", event: "Signal lost", location: "Semarang" },
  { id: "5", unit: "B 7788 BCD", driver: "Muhammad Rizki", channel: "Cabin", status: "Live", event: "Normal route", location: "Bekasi" },
];

const statusColors: Record<string, string> = {
  Live: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  Review: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  Offline: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

const statusDotColors: Record<string, string> = {
  Live: "bg-emerald-500",
  Review: "bg-amber-500",
  Offline: "bg-zinc-400",
};

export default function DashcamPage() {
  const { addToast } = useToast();
  const [selectedCamera, setSelectedCamera] = useState<CameraChannel>(cameras[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  function handleCameraSelect(camera: CameraChannel) {
    setSelectedCamera(camera);
    setIsPlaying(camera.status === "Live");
    addToast("info", `Switched to ${camera.unit} - ${camera.channel}`);
  }

  function handlePlayPause() {
    setIsPlaying(!isPlaying);
    addToast("info", isPlaying ? "Paused" : "Playing");
  }

  function handleSnapshot() {
    addToast("success", "Snapshot captured and saved");
  }

  function handleFullscreen() {
    addToast("info", "Fullscreen mode");
  }

  function handleSpeedChange(speed: number) {
    setPlaybackSpeed(speed);
    addToast("info", `Playback speed: ${speed}x`);
  }

  return (
    <div className="min-h-full bg-zinc-50 px-7 py-6 dark:bg-zinc-950">
      <div className="mb-6">
        <p className="metric-label">Video monitoring</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">Dashcam Monitor</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Monitor kamera kendaraan untuk safety, bukti pengiriman, dan investigasi event.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        <section className="card overflow-hidden">
          <div className="relative h-[520px] bg-zinc-900">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
            <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white">
              <span className={`h-2 w-2 rounded-full ${statusDotColors[selectedCamera.status]}`} />
              {selectedCamera.status.toUpperCase()} {selectedCamera.unit} - {selectedCamera.channel.toUpperCase()}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              {selectedCamera.status === "Offline" ? (
                <div className="text-center text-white/50">
                  <Video className="mx-auto h-16 w-16 opacity-30" />
                  <p className="mt-2 text-sm font-semibold">Camera offline</p>
                </div>
              ) : !isPlaying ? (
                <button onClick={handlePlayPause} className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25">
                  <Play className="h-9 w-9 fill-current" />
                </button>
              ) : null}
            </div>

            <div className="absolute bottom-5 left-5 right-5 rounded-md bg-black/45 p-4 text-white backdrop-blur">
              <div className="mb-3 flex items-center gap-4">
                {selectedCamera.status === "Review" && (
                  <div className="flex-1">
                    <div className="h-1 rounded-full bg-white/20"><div className="h-full w-1/3 rounded-full bg-emerald-500" /></div>
                    <div className="mt-1 flex justify-between text-[10px] opacity-75"><span>00:05:32</span><span>00:15:45</span></div>
                  </div>
                )}
                {selectedCamera.status === "Live" && <div className="flex-1 text-center"><span className="font-mono text-lg">{new Date().toLocaleTimeString("id-ID")}</span></div>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedCamera.status !== "Offline" && (
                    <button onClick={handlePlayPause} className="rounded-md bg-white/15 p-2 hover:bg-white/25">
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                    </button>
                  )}
                  {selectedCamera.status === "Review" && (
                    <>
                      <button className="rounded-md bg-white/15 p-2 hover:bg-white/25"><SkipBack className="h-5 w-5" /></button>
                      <button className="rounded-md bg-white/15 p-2 hover:bg-white/25"><SkipForward className="h-5 w-5" /></button>
                    </>
                  )}
                  <button onClick={() => setIsMuted(!isMuted)} className="rounded-md bg-white/15 p-2 hover:bg-white/25">
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                  {!isMuted && <Volume2 className="h-5 w-5 opacity-75" />}
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold">{selectedCamera.driver}</p>
                  <p className="text-xs font-semibold opacity-75">{selectedCamera.location}</p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCamera.status === "Review" && (
                    <div className="flex items-center gap-1 mr-2">
                      {[1, 2, 4].map((speed) => (
                        <button key={speed} onClick={() => handleSpeedChange(speed)} className={`rounded px-2 py-1 text-xs font-bold ${playbackSpeed === speed ? "bg-emerald-500 text-white" : "bg-white/15 hover:bg-white/25"}`}>{speed}x</button>
                      ))}
                    </div>
                  )}
                  <button onClick={handleSnapshot} className="rounded-md bg-white/15 p-2 hover:bg-white/25"><Camera className="h-5 w-5" /></button>
                  <button onClick={handleFullscreen} className="rounded-md bg-white/15 p-2 hover:bg-white/25"><Maximize2 className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="card p-5">
            <p className="metric-label">Camera channels</p>
            <div className="mt-4 space-y-3">
              {cameras.map((camera) => (
                <button key={camera.id} onClick={() => handleCameraSelect(camera)} className={`w-full rounded-md border p-3 text-left transition-all ${selectedCamera.id === camera.id ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"}`}>
                  <div className="flex items-center justify-between">
                    <p className={`font-bold ${selectedCamera.id === camera.id ? "text-zinc-900 dark:text-white" : "text-zinc-800 dark:text-white"}`}>{camera.unit}</p>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusColors[camera.status]}`}>{camera.status}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-zinc-500">{camera.driver} - {camera.channel}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300"><CircleDot className="h-3 w-3 text-amber-500" /> {camera.event}</p>
                </button>
              ))}
            </div>
          </div>

          {cameras.filter((c) => c.status === "Offline").length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              <p className="mt-3 text-sm font-bold">{cameras.filter((c) => c.status === "Offline").length} dashcam offline and needs attention.</p>
            </div>
          )}

          <div className="card p-5">
            <p className="metric-label">Recent events</p>
            <div className="mt-4 space-y-3">
              {[{ time: "09:42", unit: "B 1234 KJT", event: "Arrival gate", type: "Normal" }, { time: "09:28", unit: "B 5678 TGP", event: "Speed alert 95km/h", type: "Alert" }, { time: "09:15", unit: "L 3456 ABC", event: "Harsh brake", type: "Alert" }, { time: "08:55", unit: "B 7788 BCD", event: "Geofence entry", type: "Normal" }].map((event, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md border border-zinc-100 p-3 dark:border-zinc-800">
                  <div className="text-center"><p className="text-xs font-bold text-zinc-500">{event.time}</p></div>
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-white">{event.unit}</p>
                    <p className={`text-xs font-semibold ${event.type === "Alert" ? "text-amber-600 dark:text-amber-400" : "text-zinc-500"}`}>{event.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
