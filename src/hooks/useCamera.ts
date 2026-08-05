'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraPermissionState } from '@/types';
import { CAMERA_VIDEO_CONSTRAINTS } from '@/constants';

interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  permission: CameraPermissionState;
  errorMessage: string | null;
  requestCamera: () => Promise<void>;
  stopCamera: () => void;
}

/**
 * Owns the webcam permission flow and the underlying MediaStream.
 * Requests access automatically on mount; exposes `requestCamera` again
 * so the PermissionDialog can offer a manual retry after a denial.
 */
export function useCamera(autoStart = true): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permission, setPermission] = useState<CameraPermissionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const requestCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPermission('unavailable');
      setErrorMessage('This browser does not support webcam access.');
      return;
    }

    setPermission('requesting');
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: CAMERA_VIDEO_CONSTRAINTS,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {
          /* autoplay can reject before user gesture on some mobile browsers;
             the <video> element's own controls/gesture will resolve this. */
        });
      }
      setPermission('granted');
    } catch (err) {
      const name = err instanceof Error ? err.name : 'UnknownError';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setPermission('denied');
        setErrorMessage('Camera access was denied.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setPermission('unavailable');
        setErrorMessage('No camera device was found.');
      } else {
        setPermission('error');
        setErrorMessage(err instanceof Error ? err.message : 'Could not access the camera.');
      }
    }
  }, []);

  useEffect(() => {
    if (autoStart) requestCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { videoRef, permission, errorMessage, requestCamera, stopCamera };
}
