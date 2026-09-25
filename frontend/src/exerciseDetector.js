export function calculateAngle(pointA, pointB, pointC) {
  if (!pointA || !pointB || !pointC) {
    return 180;
  }

  const radians =
    Math.atan2(
      pointC.y - pointB.y,
      pointC.x - pointB.x
    ) -
    Math.atan2(
      pointA.y - pointB.y,
      pointA.x - pointB.x
    );

  let angle = Math.abs(
    radians * (180 / Math.PI)
  );

  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
}


function landmarksVisible(
  landmarks,
  minVisibility = 0.35
) {
  const requiredPoints = [
    23, // left hip
    24, // right hip
    25, // left knee
    26, // right knee
    27, // left ankle
    28  // right ankle
  ];

  return requiredPoints.every((index) => {
    const point = landmarks[index];

    return (
      point &&
      (
        point.visibility === undefined ||
        point.visibility >= minVisibility
      )
    );
  });
}


function getTorsoLength(landmarks) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (
    !leftShoulder ||
    !rightShoulder ||
    !leftHip ||
    !rightHip
  ) {
    return 1.0;
  }

  const shoulderY =
    (leftShoulder.y + rightShoulder.y) / 2;

  const hipY =
    (leftHip.y + rightHip.y) / 2;

  const torsoLength = Math.abs(
    hipY - shoulderY
  );

  if (torsoLength > 0.05) {
    return torsoLength;
  }

  return 1.0;
}


export function detectSquat(
  landmarks,
  baselineHipY
) {
  if (
    !landmarks ||
    landmarks.length < 29 ||
    !landmarksVisible(landmarks, 0.35)
  ) {
    return {
      detected: false,
      position: "unknown",
      leftKneeAngle: null,
      rightKneeAngle: null,
      hipY: null,
      normalizedDrop: 0
    };
  }


  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];

  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];


  const leftKneeAngle = calculateAngle(
    leftHip,
    leftKnee,
    leftAnkle
  );

  const rightKneeAngle = calculateAngle(
    rightHip,
    rightKnee,
    rightAnkle
  );


  const averageKneeAngle =
    (leftKneeAngle + rightKneeAngle) / 2;


  const currentHipY =
    (leftHip.y + rightHip.y) / 2;


  /*
    First frame is used to establish
    the standing hip position.
  */
  if (baselineHipY === null) {
    return {
      detected: true,
      position: "calibrating",
      leftKneeAngle: Math.round(leftKneeAngle),
      rightKneeAngle: Math.round(rightKneeAngle),
      hipY: currentHipY,
      normalizedDrop: 0
    };
  }


  const torsoLength =
    getTorsoLength(landmarks);


  const rawDrop =
    currentHipY - baselineHipY;


  const normalizedDrop =
    rawDrop / torsoLength;


  /*
    More tolerant squat detection.

    Previous:
    knee angle < 105
    hip drop >= 0.25

    New:
    knee angle < 115
    hip drop >= 0.18
  */

  const isSquat =
    averageKneeAngle < 115 &&
    normalizedDrop >= 0.18;


  const isStanding =
    averageKneeAngle > 155 &&
    normalizedDrop < 0.15;


  let position = "transition";


  if (isSquat) {
    position = "squat";
  } else if (isStanding) {
    position = "standing";
  }


  return {
    detected: true,
    position,
    leftKneeAngle: Math.round(leftKneeAngle),
    rightKneeAngle: Math.round(rightKneeAngle),
    hipY: currentHipY,
    normalizedDrop
  };
}