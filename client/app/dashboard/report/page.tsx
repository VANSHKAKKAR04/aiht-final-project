"use client";

import axios from "axios";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [anonymous, setAnonymous] = useState(false);
  const [complaint, setComplaint] = useState({
    name: "",
    location: "",
    datetime: null,
    subject: "",
    description: "",
    contact: "",
    email: "",
    file: null,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [geoLocation, setGeoLocation] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing webcam: ", err));

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setGeoLocation(`${lat}, ${lon}`);
        },
        (error) => {
          console.error("Error fetching location:", error);
          setGeoLocation(null);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation not supported.");
      setGeoLocation(null);
    }
  }, []);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext("2d");
      context!.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");

      const byteString = atob(imageDataUrl.split(",")[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uintArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uintArray[i] = byteString.charCodeAt(i);
      }

      const file = new Blob([uintArray], { type: "image/png" });
      const fileObject = new File([file], "captured-image.png", {
        type: "image/png",
      });

      setCapturedImage(fileObject);
      return fileObject;
    }
    return null;
  };

  const handleSubmit = async () => {
    const res = await axios.post("http://localhost:8000/api/fir", {
      subject: complaint.subject,
      description: complaint.description,
    });

    console.log(res);
  };

  return (
    <div className="grid grid-cols-2 gap-4 pt-10">
      <div className="flex flex-col items-center w-full">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Camera />
          Report Immediately
        </h2>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-[500px] rounded-lg border border-primary"
        />
        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
          width="640"
          height="480"
        ></canvas>
      </div>
      <div className="p-6 rounded-lg shadow-md w-full max-h-[500px] overflow-y-auto no-scrollbar">
        <h2 className="text-3xl font-bold text-primary mb-6">📝 File an FIR</h2>
        <p className="text-base-content/80">
          Submit an FIR anonymously or with full details.
        </p>
        <div className="mt-4">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
            className="toggle toggle-primary mr-2"
          />
          <span className="text-base-content/60">Submit Anonymously</span>
        </div>
        {!anonymous && (
          <>
            <label className="block text-white mt-4">Your Name</label>
            <input
              className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-500 placeholder-white focus:border-blue-500 focus:outline-none hover:border-blue-500"
              placeholder="Your Name"
              onChange={(e) =>
                setComplaint({ ...complaint, name: e.target.value })
              }
            />

            <label className="block text-white mt-4">Your Location</label>
            <input
              className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-500 placeholder-white focus:border-blue-500 focus:outline-none hover:border-blue-500"
              placeholder="Your Location"
              onChange={(e) =>
                setComplaint({ ...complaint, location: e.target.value })
              }
            />

            <label className="block text-white mt-4">Contact Number</label>
            <input
              className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-500 placeholder-white focus:border-blue-500 focus:outline-none hover:border-blue-500"
              placeholder="Contact Number"
              onChange={(e) =>
                setComplaint({ ...complaint, contact: e.target.value })
              }
            />

            <label className="block text-white mt-4">Email Address</label>
            <input
              className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-500 placeholder-white focus:border-blue-500 focus:outline-none hover:border-blue-500"
              placeholder="Email Address"
              onChange={(e) =>
                setComplaint({ ...complaint, email: e.target.value })
              }
            />
          </>
        )}

        <label className="block text-base-content mt-4">Subject</label>
        <input
          className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-500 placeholder-white focus:border-blue-500 focus:outline-none hover:border-blue-500"
          placeholder="Subject"
          onChange={(e) =>
            setComplaint({ ...complaint, subject: e.target.value })
          }
        />

        <label className="block text-white mt-4">Describe the incident</label>
        <textarea
          className="mt-2 p-3 w-full bg-gray-700 text-white border border-gray-500 placeholder-white focus:border-blue-500 focus:outline-none hover:border-blue-500"
          rows={4}
          placeholder="Describe the incident..."
          onChange={(e) =>
            setComplaint({ ...complaint, description: e.target.value })
          }
        />

        <label className="block text-white mt-4">Upload Evidence</label>

        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit FIR
        </button>
      </div>
    </div>
  );
}
