// Segmentation model parameters placeholder.
// After running the notebook cell to dump JSON of scaler & kmeans, paste values below.
// Example notebook extraction:
// import json; print(json.dumps({
//  'scaler_center': scaler.center_.tolist(),
//  'scaler_scale': scaler.scale_.tolist(),
//  'cluster_centers': kmeans.cluster_centers_.tolist()
// }))

const SEGMENTATION_MODEL = {
  clusterFeatures: [
    "spend_intensity",
    "Wines_share",
    "Fruits_share",
    "Fish_share",
    "Sweets_share",
    "NumWebPurchases",
    "NumWebVisitsMonth",
    "web_share",
    "NumDealsPurchases",
  ],
  scalerCenter: [
    5.515440821314845, 0.7611422906762473, 0.05315274142380256,
    0.0797196261664387, 0.05515146706152799, 4.0, 6.0, 0.3333333333333333, 2.0,
  ],
  scalerScale: [
    2.8815611282140097, 0.34798201728209044, 0.10807107910304428,
    0.16593978258974565, 0.11337883774739944, 4.0, 4.0, 0.15000000000000002,
    2.0,
  ],
  clusterCenters: [
    [
      -0.5362988490159738, -1.3233863827255035, 1.4707521518309168,
      1.2076563028074556, 1.3406782454754056, -0.36464646464646516,
      -0.012626262626262957, -0.06994449944242653, -0.06565656565656608,
    ],
    [
      0.0614090466724502, 0.2635853201216697, -0.10774349350316914,
      -0.11289391861446224, -0.09271155927931946, 0.5812788906009244,
      0.18104776579352874, 0.6355622297324914, 1.0446841294298923,
    ],
    [
      -0.06182775417814905, 0.08218772426089141, 0.038030145987692776,
      0.07519639477945814, 0.049797584497630526, -0.1394589552238814,
      -0.4556902985074631, -0.4135514221669457, -0.2677238805970136,
    ],
  ],
};

function classifyCartClient(cartItems) {
  if (!Array.isArray(cartItems) || !cartItems.length) {
    return { error: "Cart empty" };
  }
  const { scalerCenter, scalerScale, clusterCenters, clusterFeatures } =
    SEGMENTATION_MODEL;
  if (!scalerCenter.length || !scalerScale.length || !clusterCenters.length) {
    return {
      error:
        "Model parameters missing. Fill scalerCenter, scalerScale, clusterCenters.",
    };
  }
  const cats = ["Wines", "Fruits", "Fish", "Sweets"];
  const spend = { Wines: 0, Fruits: 0, Fish: 0, Sweets: 0 };
  cartItems.forEach((it) => {
    const cat = (it.category || "").toLowerCase();
    const amt = Number(it.price || 0) * Number(it.qty || 0);
    if (cat === "wines") spend.Wines += amt;
    else if (cat === "fruits") spend.Fruits += amt;
    else if (cat === "fish") spend.Fish += amt;
    else if (cat === "sweets") spend.Sweets += amt;
  });
  const spend4 = Object.values(spend).reduce((a, b) => a + b, 0);
  const eps = 1e-9;
  const shares = {
    Wines_share: spend.Wines / (spend4 + eps),
    Fruits_share: spend.Fruits / (spend4 + eps),
    Fish_share: spend.Fish / (spend4 + eps),
    Sweets_share: spend.Sweets / (spend4 + eps),
  };
  const spend_intensity = Math.log1p(spend4);
  // Behavioral defaults (could be enhanced later)
  const NumWebPurchases = 0;
  const NumWebVisitsMonth = 0;
  const web_share = 0; // since purchases = 0
  const NumDealsPurchases = 0;
  const row = {
    spend_intensity,
    ...shares,
    NumWebPurchases,
    NumWebVisitsMonth,
    web_share,
    NumDealsPurchases,
  };
  const featureVector = clusterFeatures.map((f) => row[f] ?? 0);
  // Scale: (x - center)/scale (RobustScaler behavior after fit)
  const scaled = featureVector.map(
    (v, i) => (v - scalerCenter[i]) / scalerScale[i]
  );
  // Find nearest centroid (centers already in scaled space)
  let bestIdx = -1,
    bestDist = Infinity;
  clusterCenters.forEach((centroid, idx) => {
    let d = 0;
    for (let i = 0; i < centroid.length; i++) {
      const diff = scaled[i] - centroid[i];
      d += diff * diff;
    }
    if (d < bestDist) {
      bestDist = d;
      bestIdx = idx;
    }
  });
  return {
    cluster: bestIdx,
    distance: Math.sqrt(bestDist),
    spend4: spend4,
    shares,
    features_row: row,
  };
}

function renderClusterPrediction() {
  const box = document.getElementById("clusterPrediction");
  if (!box || !window.cartAPI) return;
  const sample = window.cartAPI.toSegmentationSample();
  const result = classifyCartClient(sample);
  if (result.error) {
    box.textContent = "Segment: " + result.error;
    box.className = "segment-box segment-error";
    return;
  }
  box.innerHTML =
    `<strong>Predicted Segment Cluster:</strong> ${result.cluster} ` +
    `(distance ${result.distance.toFixed(3)})`;
  box.className = "segment-box";
}

document.addEventListener("DOMContentLoaded", renderClusterPrediction);
