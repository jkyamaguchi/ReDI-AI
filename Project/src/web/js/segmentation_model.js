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
  clusterProfiles: {
    0: {
      id: 0,
      name: "Low Web Engagement",
      description:
        "Low wine preference, balanced product mix, minimal spending. Not yet converted to web channel.",
      size: { percentage: 22.3, count: 494 },
      metrics: {
        wineShare: -1.32,
        spendIntensity: -0.54,
        dealSensitivity: "Low",
      },
      characteristics: [
        "Low wine share",
        "Low to moderate spend intensity",
        "Few web purchases and visits",
        "Low deal sensitivity",
      ],
      strategy:
        "Convert to web with UX optimization, first-purchase discounts, educational content",
    },
    1: {
      id: 1,
      name: "High-Value Web Enthusiast",
      description:
        "High wine preference, premium spender, frequent web user. Most valuable segment.",
      size: { percentage: 28.7, count: 635 },
      metrics: {
        wineShare: 0.26,
        spendIntensity: 0.06,
        webPurchases: 0.58,
        dealSensitivity: 1.04,
      },
      characteristics: [
        "High wine share",
        "Strong spend intensity",
        "High web purchases",
        "High deal sensitivity",
      ],
      strategy:
        "Upsell/cross-sell premium wines, push exclusive subscriptions, loyalty rewards",
    },
    2: {
      id: 2,
      name: "Deal-Seeker",
      description:
        "Moderate spender, deal-sensitive, moderate web engagement. Price-conscious segment.",
      size: { percentage: 49.0, count: 1083 },
      metrics: {
        productPreference: -0.06,
        spendIntensity: -0.06,
        webPurchases: -0.14,
        dealSensitivity: -0.27,
      },
      characteristics: [
        "Balanced product preference",
        "Moderate spend intensity",
        "Low web purchases",
        "Low deal sensitivity",
      ],
      strategy:
        "Flash sales, targeted coupons, time-limited bundles, free shipping thresholds",
    },
  },
};

function getClusterProfile(clusterId) {
  const profile = SEGMENTATION_MODEL.clusterProfiles[clusterId];
  return profile || null;
}

function classifyCartClient(cartItems, behaviorOverrides = null) {
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
  // Behavioral defaults (can be overridden to better match cluster 1)
  let NumWebPurchases = 0;
  let NumWebVisitsMonth = 0;
  let web_share = 0; // since purchases = 0
  let NumDealsPurchases = 0;
  if (behaviorOverrides && typeof behaviorOverrides === "object") {
    if (Number.isFinite(behaviorOverrides.NumWebPurchases)) {
      NumWebPurchases = behaviorOverrides.NumWebPurchases;
    }
    if (Number.isFinite(behaviorOverrides.NumWebVisitsMonth)) {
      NumWebVisitsMonth = behaviorOverrides.NumWebVisitsMonth;
    }
    if (Number.isFinite(behaviorOverrides.web_share)) {
      web_share = behaviorOverrides.web_share;
    }
    if (Number.isFinite(behaviorOverrides.NumDealsPurchases)) {
      NumDealsPurchases = behaviorOverrides.NumDealsPurchases;
    }
  }
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
    profile: getClusterProfile(bestIdx),
  };
}

function renderClusterPrediction() {
  const box = document.getElementById("clusterPrediction");
  if (!box || !window.cartAPI) return;
  const sample = window.cartAPI.toSegmentationSample();

  // First classify with zero behavioral values to see natural cart tendency
  const baseResult = classifyCartClient(sample, {
    NumWebPurchases: 0,
    NumWebVisitsMonth: 0,
    web_share: 0,
    NumDealsPurchases: 0,
  });

  let finalResult;
  // If base classification suggests high-value cart (cluster 1 territory),
  // apply positive behavioral defaults; otherwise keep behavioral zeros
  if (
    baseResult.spend4 > 150 &&
    baseResult.shares.Wines_share > 0.75 &&
    baseResult.shares.Wines_share < 0.9
  ) {
    // High wine share + high spend = likely Cluster 1 with web behavior
    finalResult = classifyCartClient(sample, {
      NumWebPurchases: 2,
      NumWebVisitsMonth: 6,
      web_share: 0.7,
      NumDealsPurchases: 2,
    });
  } else {
    // Use zero behavioral values (Cluster 0 or Cluster 2)
    finalResult = baseResult;
  }

  if (finalResult.error) {
    box.textContent = "Segment: " + finalResult.error;
    box.className = "segment-box segment-error";
    return;
  }

  const profile = finalResult.profile;
  const profileHTML = profile
    ? `
    <div class="cluster-profile cluster-${profile.id}">
      <div class="profile-header">
        <div class="profile-title">
          <h2>${profile.name}</h2>
          <span class="cluster-badge">Cluster ${finalResult.cluster}</span>
        </div>
        <div class="profile-size-badge">${profile.size.percentage}%</div>
      </div>
      
      <div class="profile-description">${profile.description}</div>
      
      <div class="profile-grid">
        <div class="profile-section characteristics-section">
          <h3>Key Characteristics</h3>
          <ul>
            ${profile.characteristics.map((c) => `<li>${c}</li>`).join("")}
          </ul>
        </div>

        <div class="profile-section metrics-section">
          <h3>Segment Metrics</h3>
          <ul class="metrics-list">
            ${Object.entries(profile.metrics)
              .map(([key, val]) => {
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());
                const display = typeof val === "number" ? val.toFixed(2) : val;
                const metricClass =
                  typeof val === "number"
                    ? val > 0
                      ? "metric-positive"
                      : val < 0
                      ? "metric-negative"
                      : "metric-neutral"
                    : "metric-text";
                return `<li><span class="metric-label">${label}:</span> <span class="metric-value ${metricClass}">${display}</span></li>`;
              })
              .join("")}
          </ul>
        </div>
      </div>
      
      <div class="profile-section strategy-section">
        <h3>Recommended Strategy</h3>
        <p>${profile.strategy}</p>
      </div>
      
      <div class="prediction-meta">
        <span class="meta-item">Distance: <strong>${finalResult.distance.toFixed(
          3
        )}</strong></span>
        <span class="meta-item">Cart Total: <strong>$${finalResult.spend4.toFixed(
          2
        )}</strong></span>
        <span class="meta-item">Population: <strong>${profile.size.count.toLocaleString()} customers</strong></span>
      </div>
    </div>
  `
    : `<div class="cluster-profile error"><strong>Unknown Cluster:</strong> ${finalResult.cluster}</div>`;

  box.innerHTML = profileHTML;
  box.className = `segment-box segment-cluster-${finalResult.cluster}`;
}

document.addEventListener("DOMContentLoaded", renderClusterPrediction);
