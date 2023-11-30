import React, { useRef, useEffect, useState } from "react";
import './App.css';

const constraints = (window.constraints = {
  video: {
    pan: true,
    tilt: true,
    zoom: true,
  },
});

const WebcamComponent = () => {
  const videoRef = useRef(null);
  const zoomRangeRef = useRef(null);
  const panRangeRef = useRef(null);
  const tiltRangeRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Cleanup function
  const cleanupFunction = () => {
    if (videoRef.current && isVideoPlaying) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    const setCapabilities = (stream) => {
      const [track] = ([window.track] = stream.getVideoTracks());
      const capabilities = track.getCapabilities();
      const settings = track.getSettings();
      for (const ptz of ["pan", "tilt", "zoom"]) {
        if (!(ptz in settings)) {
          console.log(`Camera does not support ${ptz}.`);
          continue;
        }

        let inputRef = null;

        if (ptz === "zoom") {
          inputRef = zoomRangeRef;
        } else if (ptz === "pan") {
          inputRef = panRangeRef;
        } else if (ptz === "tilt") {
          inputRef = tiltRangeRef;
        }

        const input = inputRef.current;

        if (input) {
          input.min = capabilities[ptz].min;
          input.max = capabilities[ptz].max;
          input.step = capabilities[ptz].step;
          input.value = settings[ptz];
          input.disabled = false;

          input.oninput = async (event) => {
            try {
              console.log(
                "Updated constraints values: min",
                input.min,
                "===max===",
                input.max,
                "===step===",
                input.step,
                "===",
                input.value
              );

              const constraints = {
                advanced: [{ [ptz]: parseFloat(input.value) }],
              };
              console.log("Updated constraints:", constraints);

              track.applyConstraints(constraints);
            } catch (err) {
              console.error("applyConstraints() failed: ", err);
            }
          };
        }
      }
    };

    if (videoRef.current && isVideoPlaying) {
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          videoRef.current.srcObject = stream;
          setCapabilities(stream);
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
        });
    }

    // Cleanup function
    return cleanupFunction;
  }, [isVideoPlaying]);

  const handleStartVideo = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="main-container">
      <button onClick={handleStartVideo}>Start Video</button>
      
      <video
        ref={videoRef}
        width={640}
        height={480}
        autoPlay
        playsInline
        muted
      />

      <div className="ranges">
        <label>
          Zoom:
          <input type="range" ref={zoomRangeRef} />
        </label>
        <label>
          Pan:
          <input type="range" ref={panRangeRef} />
        </label>
        <label>
          Tilt:
          <input type="range" ref={tiltRangeRef} />
        </label>
      </div>
    </div>
  );
};

export default WebcamComponent;
                                                                           