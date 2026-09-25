import { useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

function TrainerPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const animationRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // Exact timer management refs
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const accumulatedDurationRef = useRef(0);

  // Locked values to protect against resetting on stop
  const lockedRepsRef = useRef(0);
  const lockedDurationRef = useRef(0);
  const currentRepsRef = useRef(0);

  // Synchronization refs for detection loop
  const workoutActiveRef = useRef(false);
  const workoutEndedRef = useRef(false);
  const exerciseRef = useRef("squat");

  const [cameraOn, setCameraOn] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const [exercise, setExercise] = useState("squat");
  const [reps, setReps] = useState(0);
  const [formScore, setFormScore] = useState(0);

  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutEnded, setWorkoutEnded] = useState(false);

  const [duration, setDuration] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [feedback, setFeedback] = useState(
    "Start a workout session to begin AI exercise detection."
  );

  /*
   =========================================================
   STATE MACHINES (PHYSICAL MOTION LOCK - ZERO GHOST REPS)
   =========================================================
  */

  const squatStateRef = useRef({
    stage: "IDLE", // IDLE -> BOTTOM -> IDLE
    consecutiveDownFrames: 0,
    consecutiveUpFrames: 0,
    lastRepTime: 0
  });

  const curlStateRef = useRef({
    stage: "IDLE", // IDLE -> TOP -> IDLE
    consecutiveCurledFrames: 0,
    consecutiveExtendedFrames: 0,
    lastRepTime: 0
  });

  const resetDetectionStages = () => {
    squatStateRef.current = {
      stage: "IDLE",
      consecutiveDownFrames: 0,
      consecutiveUpFrames: 0,
      lastRepTime: 0
    };
    curlStateRef.current = {
      stage: "IDLE",
      consecutiveCurledFrames: 0,
      consecutiveExtendedFrames: 0,
      lastRepTime: 0
    };
  };

  /*
   =========================================================
   TRUE 2D ANGLE CALCULATION (ASPECT RATIO CORRECTED)
   =========================================================
  */

  const calculateCorrectedAngle = (a, b, c, width, height) => {
    // Un-normalize coordinates using real pixel dimensions to stop aspect distortion
    const ax = a.x * width;
    const ay = a.y * height;
    const bx = b.x * width;
    const by = b.y * height;
    const cx = c.x * width;
    const cy = c.y * height;

    const radians =
      Math.atan2(cy - by, cx - bx) - Math.atan2(ay - by, ax - bx);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360.0 - angle;
    return angle;
  };

  /*
   =========================================================
   CAMERA & MODEL SETUP
   =========================================================
  */

  const startCamera = async () => {
    try {
      setError("");
      setSaveMessage("");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported by this browser.");
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;

      await new Promise((resolve) => {
        if (video.readyState >= 1) resolve();
        else video.onloadedmetadata = () => resolve();
      });

      await video.play();
      setCameraOn(true);
      await loadPoseModel();
    } catch (err) {
      console.error("Camera error:", err);
      setError("Unable to start webcam. Please grant permission.");
    }
  };

  const loadPoseModel = async () => {
    if (poseLandmarkerRef.current) {
      startPoseDetection();
      return;
    }

    try {
      setAiLoading(true);
      setError("");

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const modelPath =
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

      let poseLandmarker;
      try {
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: modelPath, delegate: "GPU" },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.6,
          minPosePresenceConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
      } catch (gpuError) {
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: modelPath, delegate: "CPU" },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.6,
          minPosePresenceConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
      }

      poseLandmarkerRef.current = poseLandmarker;
      setAiLoading(false);
      setFeedback("AI tracking is ready. Step back to show your body.");
      startPoseDetection();
    } catch (err) {
      console.error("Pose Model Error:", err);
      setAiLoading(false);
      setError("Failed to load AI model.");
    }
  };

  /*
   =========================================================
   CANVAS SKELETON DRAWING
   =========================================================
  */

  const drawSkeleton = (ctx, landmarks, width, height) => {
    const connections = [
      [11, 12], [11, 13], [13, 15],
      [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [27, 29], [29, 31],
      [24, 26], [26, 28], [28, 30], [30, 32]
    ];

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#22c55e";

    connections.forEach(([startIndex, endIndex]) => {
      const start = landmarks[startIndex];
      const end = landmarks[endIndex];
      if (!start || !end) return;
      if ((start.visibility ?? 1) < 0.45 || (end.visibility ?? 1) < 0.45) return;

      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    });

    landmarks.forEach((landmark) => {
      if ((landmark.visibility ?? 1) < 0.45) return;
      ctx.beginPath();
      ctx.arc(landmark.x * width, landmark.y * height, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#22c55e";
      ctx.stroke();
    });
  };

  /*
   =========================================================
   ROBUST SQUAT ENGINE (ZERO GHOST COUNTS)
   =========================================================
  */

  const analyzeSquat = (landmarks, width, height) => {
    if (!workoutActiveRef.current || workoutEndedRef.current) return;

    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    // Must have solid visibility on hips, knees, and ankles
    const leftValid =
      leftHip && leftKnee && leftAnkle &&
      (leftHip.visibility ?? 1) > 0.5 &&
      (leftKnee.visibility ?? 1) > 0.5 &&
      (leftAnkle.visibility ?? 1) > 0.4;

    const rightValid =
      rightHip && rightKnee && rightAnkle &&
      (rightHip.visibility ?? 1) > 0.5 &&
      (rightKnee.visibility ?? 1) > 0.5 &&
      (rightAnkle.visibility ?? 1) > 0.4;

    if (!leftValid && !rightValid) {
      setFeedback("Make sure hips, knees, and ankles are clearly visible.");
      return;
    }

    let kneeAngle;
    if (leftValid && rightValid) {
      const leftAngle = calculateCorrectedAngle(leftHip, leftKnee, leftAnkle, width, height);
      const rightAngle = calculateCorrectedAngle(rightHip, rightKnee, rightAnkle, width, height);
      kneeAngle = (leftAngle + rightAngle) / 2;
    } else if (leftValid) {
      kneeAngle = calculateCorrectedAngle(leftHip, leftKnee, leftAnkle, width, height);
    } else {
      kneeAngle = calculateCorrectedAngle(rightHip, rightKnee, rightAnkle, width, height);
    }

    const state = squatStateRef.current;
    const now = Date.now();

    // 1. Standing Upright Condition
    if (kneeAngle > 160) {
      state.consecutiveUpFrames += 1;
      state.consecutiveDownFrames = 0;

      // Completed rep: was at BOTTOM for >=3 frames, now fully UP for >=3 frames
      if (state.stage === "BOTTOM" && state.consecutiveUpFrames >= 3) {
        if (now - state.lastRepTime > 1000) {
          state.lastRepTime = now;
          state.stage = "IDLE";
          state.consecutiveUpFrames = 0;

          currentRepsRef.current += 1;
          lockedRepsRef.current = currentRepsRef.current;
          setReps(currentRepsRef.current);

          setFormScore(96);
          setFeedback("Excellent squat rep counted!");
        }
      } else if (state.stage === "IDLE") {
        setFormScore(90);
        setFeedback("Stand tall. Squat down when ready.");
      }
    }
    // 2. Active Squat Depth Condition: Must bend below 110 degrees for at least 3 frames
    else if (kneeAngle <= 110) {
      state.consecutiveDownFrames += 1;
      state.consecutiveUpFrames = 0;

      if (state.consecutiveDownFrames >= 3) {
        state.stage = "BOTTOM";
        setFormScore(94);
        setFeedback("Good depth! Drive upwards through your heels.");
      }
    } else {
      state.consecutiveDownFrames = 0;
      state.consecutiveUpFrames = 0;
    }
  };

  /*
   =========================================================
   ROBUST BICEP CURL ENGINE (ZERO GHOST COUNTS)
   =========================================================
  */

  const analyzeBicepCurl = (landmarks, width, height) => {
    if (!workoutActiveRef.current || workoutEndedRef.current) return;

    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];

    const rightShoulder = landmarks[12];
    const rightElbow = landmarks[14];
    const rightWrist = landmarks[16];

    const leftValid =
      leftShoulder && leftElbow && leftWrist &&
      (leftShoulder.visibility ?? 1) > 0.5 &&
      (leftElbow.visibility ?? 1) > 0.5 &&
      (leftWrist.visibility ?? 1) > 0.45;

    const rightValid =
      rightShoulder && rightElbow && rightWrist &&
      (rightShoulder.visibility ?? 1) > 0.5 &&
      (rightElbow.visibility ?? 1) > 0.5 &&
      (rightWrist.visibility ?? 1) > 0.45;

    if (!leftValid && !rightValid) {
      setFeedback("Ensure your shoulders, elbows, and wrists are visible.");
      return;
    }

    const useLeft = (leftElbow?.visibility ?? 0) >= (rightElbow?.visibility ?? 0);
    const shoulder = useLeft ? leftShoulder : rightShoulder;
    const elbow = useLeft ? leftElbow : rightElbow;
    const wrist = useLeft ? leftWrist : rightWrist;

    const elbowAngle = calculateCorrectedAngle(shoulder, elbow, wrist, width, height);
    const state = curlStateRef.current;
    const now = Date.now();

    // 1. Arm Extended Down
    if (elbowAngle >= 150) {
      state.consecutiveExtendedFrames += 1;
      state.consecutiveCurledFrames = 0;

      // Completed rep: was curled at TOP for >=3 frames, now DOWN for >=3 frames
      if (state.stage === "TOP" && state.consecutiveExtendedFrames >= 3) {
        if (now - state.lastRepTime > 1000) {
          state.lastRepTime = now;
          state.stage = "IDLE";
          state.consecutiveExtendedFrames = 0;

          currentRepsRef.current += 1;
          lockedRepsRef.current = currentRepsRef.current;
          setReps(currentRepsRef.current);

          setFormScore(95);
          setFeedback("Great curl rep counted!");
        }
      } else if (state.stage === "IDLE") {
        setFormScore(90);
        setFeedback("Arm fully extended. Curl upward.");
      }
    }
    // 2. Full Curl Up
    else if (elbowAngle <= 55) {
      state.consecutiveCurledFrames += 1;
      state.consecutiveExtendedFrames = 0;

      if (state.consecutiveCurledFrames >= 3) {
        state.stage = "TOP";
        setFormScore(95);
        setFeedback("Peak contraction! Now lower your arm with control.");
      }
    } else {
      state.consecutiveCurledFrames = 0;
      state.consecutiveExtendedFrames = 0;
    }
  };

  const analyzeExercise = (landmarks, width, height) => {
    if (exerciseRef.current === "squat") {
      analyzeSquat(landmarks, width, height);
    } else if (exerciseRef.current === "bicep-curl") {
      analyzeBicepCurl(landmarks, width, height);
    }
  };

  /*
   =========================================================
   SYNCHRONIZED DETECTION LOOP & TIMERS
   =========================================================
  */

  const startPoseDetection = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    const detectPose = () => {
      animationRef.current = requestAnimationFrame(detectPose);

      if (!poseLandmarkerRef.current || video.readyState < 2) return;

      // CRITICAL: Run AI ONLY on new camera frames to stop time-based drift
      if (video.currentTime === lastVideoTimeRef.current) return;
      lastVideoTimeRef.current = video.currentTime;

      if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      let results;
      try {
        results = poseLandmarkerRef.current.detectForVideo(video, performance.now());
      } catch (err) {
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results && results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        drawSkeleton(ctx, landmarks, canvas.width, canvas.height);

        if (workoutActiveRef.current && !workoutEndedRef.current) {
          analyzeExercise(landmarks, canvas.width, canvas.height);
        }
      }
    };

    detectPose();
  };

  const startTimer = () => {
    startTimeRef.current = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const total = accumulatedDurationRef.current + currentElapsed;
        setDuration(total);
        lockedDurationRef.current = total;
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (startTimeRef.current) {
      accumulatedDurationRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
    }
    setDuration(accumulatedDurationRef.current);
    lockedDurationRef.current = accumulatedDurationRef.current;
  };

  /*
   =========================================================
   WORKOUT LIFECYCLE
   =========================================================
  */

  const startWorkout = async () => {
    setError("");
    setSaveMessage("");

    currentRepsRef.current = 0;
    lockedRepsRef.current = 0;
    accumulatedDurationRef.current = 0;
    lockedDurationRef.current = 0;

    setReps(0);
    setDuration(0);
    setFormScore(0);
    resetDetectionStages();

    workoutActiveRef.current = true;
    workoutEndedRef.current = false;
    setWorkoutStarted(true);
    setIsPaused(false);
    setWorkoutEnded(false);

    if (!cameraOn || !streamRef.current) {
      await startCamera();
    } else {
      startPoseDetection();
    }

    startTimer();
    setFeedback("Workout started. Stand in front of camera.");
  };

  const pauseWorkout = () => {
    workoutActiveRef.current = false;
    setIsPaused(true);
    pauseTimer();
    setFeedback("Workout paused. Click Resume to continue counting.");
  };

  const resumeWorkout = () => {
    workoutActiveRef.current = true;
    setIsPaused(false);
    startTimer();
    setFeedback("Workout resumed. Keep moving!");
  };

  const stopWorkout = () => {
    if (!workoutStarted) return;

    workoutActiveRef.current = false;
    workoutEndedRef.current = true;
    pauseTimer();

    lockedRepsRef.current = currentRepsRef.current;
    setReps(lockedRepsRef.current);
    setDuration(lockedDurationRef.current);

    setWorkoutStarted(false);
    setIsPaused(false);
    setWorkoutEnded(true);
    setFormScore(0);
    setFeedback("Workout stopped. Click Save Workout to record it.");

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setCameraOn(false);
  };

  const restartWorkout = async () => {
    currentRepsRef.current = 0;
    lockedRepsRef.current = 0;
    accumulatedDurationRef.current = 0;
    lockedDurationRef.current = 0;

    setReps(0);
    setDuration(0);
    setFormScore(0);
    setSaveMessage("");
    setError("");
    resetDetectionStages();

    workoutActiveRef.current = true;
    workoutEndedRef.current = false;
    setWorkoutStarted(true);
    setIsPaused(false);
    setWorkoutEnded(false);

    if (!streamRef.current) {
      await startCamera();
    } else {
      startPoseDetection();
    }

    startTimer();
    setFeedback("Workout restarted. Stand in view to begin.");
  };

  const formatDurationDisplay = (totalSec) => {
    const sec = Math.round(Number(totalSec) || 0);
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (remainingSec === 0) return `${mins}m`;
    return `${mins}m ${remainingSec}s`;
  };

  /*
   =========================================================
   SAVE WORKOUT (DATABASE PERSISTENCE)
   =========================================================
  */

  const saveWorkout = async () => {
    if (!workoutEnded) {
      setSaveMessage("Please stop the workout before saving.");
      return;
    }

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("jwt");

    if (!token) {
      setSaveMessage("Authentication token missing. Please sign in to save workouts.");
      return;
    }

    const finalReps = lockedRepsRef.current;
    const durationInSeconds = Math.round(
      lockedDurationRef.current > 0 ? lockedDurationRef.current : duration
    );

    const caloriesBurned = Math.max(1, Math.round(finalReps * 0.4 + (durationInSeconds / 60) * 4));
    const exerciseFormatted = exercise === "squat" ? "Squat" : "Bicep Curl";

    setSaving(true);
    setSaveMessage("Saving to Workouts dashboard...");

    try {
      const params = new URLSearchParams();
      params.append("exercise_name", exerciseFormatted);
      params.append("sets", "1");
      params.append("reps", String(finalReps));
      params.append("duration", String(durationInSeconds));
      params.append("calories_burned", String(caloriesBurned));

      const response = await fetch(`http://127.0.0.1:8000/workouts/?${params.toString()}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Server error while saving workout.");
      }

      setSaveMessage(
        `Workout successfully logged! Recorded ${finalReps} reps (${formatDurationDisplay(durationInSeconds)}, ${caloriesBurned} kcal). Redirecting...`
      );

      setTimeout(() => {
        window.location.href = "/workouts";
      }, 1000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExerciseChange = (nextExercise) => {
    if (workoutStarted) return;
    setExercise(nextExercise);
    exerciseRef.current = nextExercise;
    resetDetectionStages();

    if (nextExercise === "squat") {
      setFeedback("Squat selected. Start workout and squat down.");
    } else {
      setFeedback("Bicep curl selected. Start workout to begin curls.");
    }
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
      if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
    };
  }, []);

  return (
    <div className="trainer-page">
      <div className="page-header">
        <div>
          <h1>AI Gym Trainer</h1>
          <p>Real-time exercise detection and posture analysis</p>
        </div>
      </div>

      <div className="trainer-card">
        {/* EXERCISE SELECT */}
        <div className="trainer-top-controls">
          <div>
            <label>Select Exercise</label>
            <select
              value={exercise}
              onChange={(e) => handleExerciseChange(e.target.value)}
              disabled={workoutStarted}
            >
              <option value="squat">Squat</option>
              <option value="bicep-curl">Bicep Curl</option>
            </select>
          </div>
        </div>

        {/* VIDEO DISPLAY */}
        <div className="trainer-video-container">
          <video
            ref={videoRef}
            className="trainer-video"
            autoPlay
            playsInline
            muted
          />

          <canvas
            ref={canvasRef}
            className={cameraOn ? "trainer-canvas" : "trainer-canvas hidden"}
          />

          {!cameraOn && (
            <div className="trainer-camera-placeholder">
              <div>
                <div style={{ fontSize: "48px" }}>🏋️</div>
                <h3>AI Trainer Camera</h3>
                <p>Start a workout to begin exercise detection.</p>
              </div>
            </div>
          )}
        </div>

        {/* WORKOUT CONTROLS */}
        <div className="trainer-controls">
          {!workoutStarted && !workoutEnded && (
            <button
              className="primary-button"
              onClick={startWorkout}
              disabled={aiLoading}
            >
              {aiLoading ? "Loading AI..." : "▶ Start Workout"}
            </button>
          )}

          {workoutStarted && (
            <>
              {!isPaused ? (
                <button className="secondary-button" onClick={pauseWorkout}>
                  ⏸ Pause
                </button>
              ) : (
                <button className="primary-button" onClick={resumeWorkout}>
                  ▶ Resume
                </button>
              )}

              <button className="secondary-button" onClick={stopWorkout}>
                ■ Stop Workout
              </button>
            </>
          )}

          {workoutEnded && (
            <>
              <button
                className="primary-button"
                onClick={saveWorkout}
                disabled={saving}
              >
                {saving ? "Saving..." : "💾 Save Workout"}
              </button>

              <button className="secondary-button" onClick={restartWorkout}>
                ↻ New Workout
              </button>
            </>
          )}
        </div>

        {/* AI LOADING */}
        {aiLoading && (
          <div className="trainer-feedback">
            <strong>Loading AI Pose Detection...</strong>
            <p>Camera is active. Loading MediaPipe skeleton detection.</p>
          </div>
        )}

        {/* ERROR */}
        {error && <div className="trainer-error">{error}</div>}

        {/* SESSION STATS */}
        <div className="trainer-stats">
          <div className="trainer-stat-card">
            <span>Exercise</span>
            <strong>{exercise === "squat" ? "Squat" : "Bicep Curl"}</strong>
          </div>

          <div className="trainer-stat-card">
            <span>Repetitions</span>
            <strong>{reps}</strong>
          </div>

          <div className="trainer-stat-card">
            <span>Duration</span>
            <strong>{formatDurationDisplay(duration)}</strong>
          </div>
        </div>

        {/* FORM SCORE */}
        <div className="trainer-stats">
          <div className="trainer-stat-card">
            <span>Form Score</span>
            <strong>{formScore}%</strong>
          </div>

          <div className="trainer-stat-card">
            <span>Session Status</span>
            <strong>
              {workoutStarted ? (isPaused ? "Paused" : "Active") : workoutEnded ? "Stopped" : "Ready"}
            </strong>
          </div>

          <div className="trainer-stat-card">
            <span>AI Detection</span>
            <strong>{cameraOn ? (isPaused ? "Paused" : "Active") : "Off"}</strong>
          </div>
        </div>

        {/* FEEDBACK */}
        <div className="trainer-feedback">
          <strong>AI Trainer Feedback</strong>
          <p>{feedback}</p>
        </div>

        {/* SAVE MESSAGE */}
        {saveMessage && (
          <div
            className="trainer-feedback"
            style={{
              backgroundColor: "#ecfdf5",
              borderColor: "#6ee7b7",
              color: "#065f46"
            }}
          >
            <strong>Workout Session</strong>
            <p>{saveMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainerPage;