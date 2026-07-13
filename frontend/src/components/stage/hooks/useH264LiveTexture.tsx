import { H264_STREAM_PATH } from "@/constants";
import type { Detector } from "@/apps/default/hooks/actions";
import JMuxer from "jmuxer";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LinearFilter,
  SRGBColorSpace,
  VideoTexture
} from "three";


type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

type StreamStats = {
  bytesReceived: number;
  chunksReceived: number;
};



interface JMuxerInstance {
  feed(data: { video: Uint8Array }): void;
  destroy(): void;
}

export const useH264LiveTexture = ({
  url = H264_STREAM_PATH,
  detector,
  setStats,
}: {
  url?: string;
  detector: Detector;
  setStats?: (stats: StreamStats) => void;
}) => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  const socketRef = useRef<WebSocket | null>(null);
  const jmuxerRef = useRef<JMuxerInstance | null>(null);
  const statsRef = useRef<StreamStats>({ bytesReceived: 0, chunksReceived: 0 });

  const videoElement = useMemo(() => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    // Optimization for stream lag
    video.setAttribute("webkit-playsinline", "webkit-playsinline");
    return video;
  }, []);

  const texture = useMemo(() => {
    const videoTexture = new VideoTexture(videoElement);
    videoTexture.colorSpace = SRGBColorSpace;
    videoTexture.magFilter = LinearFilter;
    videoTexture.minFilter = LinearFilter;
    videoTexture.generateMipmaps = false;
    return videoTexture;
  }, [videoElement]);

  useEffect(() => {
    try {
      jmuxerRef.current = new JMuxer({
        node: videoElement,
        mode: "video",
        flushingTime: 0,
        fps: 30,
        debug: false,
        clearBuffer: true,
      });

      const socket = new WebSocket(`${url}/${detector.slot}`);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => setConnectionState("connected");
      socket.onmessage = (event: MessageEvent) => {
        const chunk = new Uint8Array(event.data as ArrayBuffer);
        statsRef.current = {
          bytesReceived: statsRef.current.bytesReceived + chunk.byteLength,
          chunksReceived: statsRef.current.chunksReceived + 1,
        };
        setStats?.({ ...statsRef.current });
        jmuxerRef.current?.feed({ video: chunk });
      };
      socket.onerror = () => setConnectionState("error");
      socket.onclose = () => setConnectionState("disconnected");
    } catch (error) {
      console.error("[Stage] Failed to initialize live stream", error);
    }

    return () => {
      socketRef.current?.close();
      jmuxerRef.current?.destroy();
      videoElement.pause();
      videoElement.src = "";
      videoElement.load();
    };
  }, [url, videoElement]); // Removed setStats to prevent loop if not memoized

  return { texture, connectionState };
};