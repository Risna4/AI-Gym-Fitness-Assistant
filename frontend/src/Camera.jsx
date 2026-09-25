import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  PoseLandmarker
} from "@mediapipe/tasks-vision";

import { detectSquat } from "./exerciseDetector";

function Camera({ onWorkoutSaved }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const poseLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Rep tracking
  const squatStateRef = useRef("standing");
  const repCountRef = useRef(0);

  // Calibration
  const calibrationFramesRef = useRef([]);
  const baselineHipYRef = useRef(null);
  const calibrationCompleteRef = useRef(false);

  // Workout timing
  const workoutStartTimeRef = useRef(null);

  // UI state
  const [cameraStarted, setCameraStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [poseDetected, setPoseDetected] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [exerciseStatus, setExerciseStatus] = useState(
    "Stand normally in front of the camera"
  );

  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [savingWorkout, setSavingWorkout] = useState(false);

  // --------------------------------
  // Initialize MediaPipe
  // --------------------------------
  const initializePose = async () => {
    try {
      const vision =
        await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

      const poseLandmarker =
        await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
              delegate: "GPU"
            },

            runningMode: "VIDEO",
            numPoses: 1
          }
        );

      poseLandmarkerRef.current =
        poseLandmarker;

      console.log(
        "MediaPipe Pose initialized"
      );

    } catch (error) {
      console.error(
        "MediaPipe initialization error:",
        error
      );

      setMessage(
        "Unable to load AI pose detection."
      );
    }
  };

  // --------------------------------
  // Draw pose
  // --------------------------------
  const drawPose = (
    context,
    landmarks,
    width,
    height
  ) => {
    landmarks.forEach((landmark) => {
      const x = landmark.x * width;
      const y = landmark.y * height;

      context.beginPath();

      context.arc(
        x,
        y,
        4,
        0,
        2 * Math.PI
      );

      context.fillStyle = "#00FF66";
      context.fill();
    });

    const connections = [
      [11, 12],

      [11, 13],
      [13, 15],

      [12, 14],
      [14, 16],

      [11, 23],
      [12, 24],

      [23, 24],

      [23, 25],
      [25, 27],

      [24, 26],
      [26, 28]
    ];

    context.strokeStyle = "#00FF66";
    context.lineWidth = 3;

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      if (!startPoint || !endPoint) {
        return;
      }

      context.beginPath();

      context.moveTo(
        startPoint.x * width,
        startPoint.y * height
      );

      context.lineTo(
        endPoint.x * width,
        endPoint.y * height
      );

      context.stroke();
    });
  };

  // --------------------------------
  // Detect pose
  // --------------------------------
  const detectPose = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseLandmarker =
      poseLandmarkerRef.current;

    if (
      !video ||
      !canvas ||
      !poseLandmarker ||
      video.readyState < 2
    ) {
      animationFrameRef.current =
        requestAnimationFrame(detectPose);

      return;
    }

    const context =
      canvas.getContext("2d");

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const results =
      poseLandmarker.detectForVideo(
        video,
        performance.now()
      );

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (
      results.landmarks &&
      results.landmarks.length > 0
    ) {
      const landmarks =
        results.landmarks[0];

      setPoseDetected(true);

      drawPose(
        context,
        landmarks,
        canvas.width,
        canvas.height
      );

      // --------------------------------
      // Calibration phase
      // --------------------------------
      if (
        !calibrationCompleteRef.current
      ) {
        const leftHip =
          landmarks[23];

        const rightHip =
          landmarks[24];

        if (
          leftHip &&
          rightHip &&
          (leftHip.visibility ?? 1) > 0.5 &&
          (rightHip.visibility ?? 1) > 0.5
        ) {
          const currentHipY =
            (leftHip.y + rightHip.y) / 2;

          calibrationFramesRef.current.push(
            currentHipY
          );

          setExerciseStatus(
            `Calibrating stance... ${calibrationFramesRef.current.length}/30`
          );

          if (
            calibrationFramesRef.current.length >=
            30
          ) {
            const values =
              calibrationFramesRef.current;

            const sum =
              values.reduce(
                (a, b) => a + b,
                0
              );

            baselineHipYRef.current =
              sum / values.length;

            calibrationCompleteRef.current =
              true;

            setExerciseStatus(
              "Calibration complete! Begin squats."
            );
          }
        }
      }

      // --------------------------------
      // Exercise tracking
      // --------------------------------
      else {
        const squat =
          detectSquat(
            landmarks,
            baselineHipYRef.current
          );

        if (squat.detected) {

          // Squat position
          if (
            squat.position === "squat" &&
            squatStateRef.current !== "squat"
          ) {
            squatStateRef.current =
              "squat";

            setExerciseStatus(
              `Squat position reached (${squat.leftKneeAngle}° / ${squat.rightKneeAngle}°)`
            );
          }

          // Returned to standing
          else if (
            squat.position === "standing" &&
            squatStateRef.current === "squat"
          ) {
            squatStateRef.current =
              "standing";

            repCountRef.current += 1;

            setRepCount(
              repCountRef.current
            );

            setExerciseStatus(
              `Repetition ${repCountRef.current} complete!`
            );
          }

          // Transition
          else if (
            squat.position === "transition"
          ) {
            setExerciseStatus(
              "Moving..."
            );
          }

        } else {
          setExerciseStatus(
            "Ensure full body is visible"
          );
        }
      }

    } else {
      setPoseDetected(false);

      setExerciseStatus(
        "No body posture detected"
      );
    }

    animationFrameRef.current =
      requestAnimationFrame(detectPose);
  };

  // --------------------------------
  // Start camera
  // --------------------------------
  const startCamera = async () => {
    try {
      setMessage(
        "Initializing camera stream..."
      );

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: 1280,
              height: 720,
              frameRate: {
                ideal: 30
              }
            }
          }
        );

      streamRef.current = stream;

      videoRef.current.srcObject =
        stream;

      await videoRef.current.play();

      // Reset workout state
      repCountRef.current = 0;

      squatStateRef.current =
        "standing";

      calibrationFramesRef.current =
        [];

      baselineHipYRef.current =
        null;

      calibrationCompleteRef.current =
        false;

      workoutStartTimeRef.current =
        Date.now();

      setRepCount(0);

      setWorkoutFinished(false);

      setWorkoutDuration(0);

      setCameraStarted(true);

      setMessage("");

      setExerciseStatus(
        "Stand upright to calibrate baseline..."
      );

      if (!poseLandmarkerRef.current) {
        await initializePose();
      }

      animationFrameRef.current =
        requestAnimationFrame(
          detectPose
        );

    } catch (error) {
      console.error(error);

      setMessage(
        "Failed to start camera or initialize MediaPipe."
      );
    }
  };

  // --------------------------------
  // Finish workout
  // --------------------------------
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(
        animationFrameRef.current
      );

      animationFrameRef.current =
        null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const canvas =
      canvasRef.current;

    if (canvas) {
      const context =
        canvas.getContext("2d");

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    // Calculate duration
    if (workoutStartTimeRef.current) {
      const durationSeconds =
        Math.floor(
          (Date.now() -
            workoutStartTimeRef.current) /
            1000
        );

      setWorkoutDuration(
        durationSeconds
      );
    }

    setCameraStarted(false);

    setPoseDetected(false);

    setWorkoutFinished(true);

    setExerciseStatus(
      "Workout finished!"
    );

    setMessage("");
  };

  // --------------------------------
  // Save workout
  // --------------------------------
  const saveWorkout = async () => {
    if (repCountRef.current <= 0) {
      setMessage(
        "No completed squats to save."
      );

      return;
    }

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      setMessage(
        "You are not logged in."
      );

      return;
    }

    setSavingWorkout(true);

    setMessage(
      "Saving workout..."
    );

    const params =
      new URLSearchParams();

    params.append(
      "exercise_name",
      "Squat"
    );

    params.append(
      "sets",
      "1"
    );

    params.append(
      "reps",
      String(repCountRef.current)
    );

    if (workoutDuration > 0) {
      const durationMinutes =
        workoutDuration / 60;

      params.append(
        "duration",
        durationMinutes.toFixed(2)
      );
    }

    try {
      const response =
        await fetch(
          `https://ai-gym-fitness-assistant-ajkp.onrender.com/workouts/?${params.toString()}`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      if (response.ok) {

        setMessage(
          "Workout saved successfully!"
        );

        setWorkoutFinished(false);

        // Tell Dashboard that a new
        // workout was saved.
        if (onWorkoutSaved) {
          onWorkoutSaved();
        }

      } else {

        setMessage(
          data.detail ||
          "Failed to save workout."
        );
      }

    } catch (error) {

      console.error(
        "Save workout error:",
        error
      );

      setMessage(
        "Unable to connect to backend."
      );

    } finally {

      setSavingWorkout(false);
    }
  };

  // --------------------------------
  // Reset workout
  // --------------------------------
  const resetWorkout = () => {

    repCountRef.current = 0;

    squatStateRef.current =
      "standing";

    calibrationFramesRef.current =
      [];

    baselineHipYRef.current =
      null;

    calibrationCompleteRef.current =
      false;

    workoutStartTimeRef.current =
      null;

    setRepCount(0);

    setWorkoutDuration(0);

    setWorkoutFinished(false);

    setExerciseStatus(
      "Stand normally in front of the camera"
    );

    setMessage("");
  };

  // --------------------------------
  // Cleanup
  // --------------------------------
  useEffect(() => {
    return () => {

      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }

      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  // --------------------------------
  // Format duration
  // --------------------------------
  const formatDuration = (
    totalSeconds
  ) => {

    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${minutes}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div className="camera-section">

      <h2>AI Gym Trainer</h2>

      <p>
        Use your camera to analyze
        your exercise movements.
      </p>

      {/* Camera */}
      <div
        className="camera-container"
        style={{
          position: "relative"
        }}
      >

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
          style={{
            width: "100%",
            height: "auto"
          }}
        />

        <canvas
          ref={canvasRef}
          className="pose-canvas"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
          }}
        />

      </div>

      {/* Rep counter */}
      <div className="rep-counter">

        <h3>Squats</h3>

        <div className="rep-number">
          {repCount}
        </div>

        <p>Repetitions</p>

      </div>

      {/* Exercise status */}
      {cameraStarted && (
        <div className="exercise-status">

          <p>
            {poseDetected
              ? "Pose detected ✓"
              : "Pose not detected"}
          </p>

          <p>
            {exerciseStatus}
          </p>

        </div>
      )}

      {/* Completed workout */}
      {workoutFinished && (
        <div className="exercise-status">

          <h3>
            Workout Complete
          </h3>

          <p>
            Exercise: Squat
          </p>

          <p>
            Repetitions: {repCount}
          </p>

          <p>
            Duration:{" "}
            {formatDuration(
              workoutDuration
            )}
          </p>

          <button
            onClick={saveWorkout}
            disabled={savingWorkout}
          >
            {savingWorkout
              ? "Saving..."
              : "Save Workout"}
          </button>

          <button
            onClick={resetWorkout}
            style={{
              marginLeft: "10px"
            }}
          >
            Start New Workout
          </button>

        </div>
      )}

      {/* Camera buttons */}
      <div className="camera-buttons">

        {!cameraStarted &&
        !workoutFinished ? (

          <button
            onClick={startCamera}
          >
            Start AI Trainer
          </button>

        ) : cameraStarted ? (

          <button
            onClick={stopCamera}
          >
            Finish Workout
          </button>

        ) : null}

      </div>

      {/* Message */}
      {message && (
        <p className="camera-message">
          {message}
        </p>
      )}

    </div>
  );
}

export default Camera;