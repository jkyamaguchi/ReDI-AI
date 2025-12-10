/**
 * Customer Segmentation Model
 * K-Means clustering model for customer classification and personalization
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const CLUSTER_TEMPLATE_PATH = "templates/cluster-profile.html";

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

// ============================================================================
// TEMPLATE LOADING
// ============================================================================

let clusterTemplateCache = null;

/**
 * Fetch cluster profile template
 * @returns {Promise<string|null>}
 */
async function loadClusterTemplate() {
  if (clusterTemplateCache) return clusterTemplateCache;

  try {
    const response = await fetch(CLUSTER_TEMPLATE_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    clusterTemplateCache = await response.text();
    return clusterTemplateCache;
  } catch (error) {
    console.error("Cluster template loading error:", error);
    return null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getClusterProfile(clusterId) {
  const profile = SEGMENTATION_MODEL.clusterProfiles[clusterId];
  return profile || null;
}

function aggregateCartSpend(cartItems) {
  const spend = { Wines: 0, Fruits: 0, Fish: 0, Sweets: 0 };
  cartItems.forEach((it) => {
    const cat = (it.category || "").toLowerCase();
    const amt = Number(it.price || 0) * Number(it.qty || 0);
    if (cat === "wines") spend.Wines += amt;
    else if (cat === "fruits") spend.Fruits += amt;
    else if (cat === "fish") spend.Fish += amt;
    else if (cat === "sweets") spend.Sweets += amt;
  });
  return spend;
}

function computeSharesAndIntensity(spend) {
  const spend4 = Object.values(spend).reduce((a, b) => a + b, 0);
  const eps = 1e-9;
  return {
    spend4,
    spend_intensity: Math.log1p(spend4),
    shares: {
      Wines_share: spend.Wines / (spend4 + eps),
      Fruits_share: spend.Fruits / (spend4 + eps),
      Fish_share: spend.Fish / (spend4 + eps),
      Sweets_share: spend.Sweets / (spend4 + eps),
    },
  };
}

function applyBehaviorOverrides(overrides) {
  const defaults = {
    NumWebPurchases: 0,
    NumWebVisitsMonth: 0,
    web_share: 0,
    NumDealsPurchases: 0,
  };
  if (!overrides || typeof overrides !== "object") return defaults;
  return {
    NumWebPurchases: Number.isFinite(overrides.NumWebPurchases)
      ? overrides.NumWebPurchases
      : defaults.NumWebPurchases,
    NumWebVisitsMonth: Number.isFinite(overrides.NumWebVisitsMonth)
      ? overrides.NumWebVisitsMonth
      : defaults.NumWebVisitsMonth,
    web_share: Number.isFinite(overrides.web_share)
      ? overrides.web_share
      : defaults.web_share,
    NumDealsPurchases: Number.isFinite(overrides.NumDealsPurchases)
      ? overrides.NumDealsPurchases
      : defaults.NumDealsPurchases,
  };
}

function scaleFeatures(featureVector, scalerCenter, scalerScale) {
  return featureVector.map((v, i) => (v - scalerCenter[i]) / scalerScale[i]);
}

function findNearestCentroid(scaledVector, clusterCenters) {
  let bestIdx = -1;
  let bestDist = Infinity;
  clusterCenters.forEach((centroid, idx) => {
    let d = 0;
    for (let i = 0; i < centroid.length; i++) {
      const diff = scaledVector[i] - centroid[i];
      d += diff * diff;
    }
    if (d < bestDist) {
      bestDist = d;
      bestIdx = idx;
    }
  });
  return { bestIdx, bestDist: Math.sqrt(bestDist) };
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

  const spend = aggregateCartSpend(cartItems);
  const { spend4, spend_intensity, shares } = computeSharesAndIntensity(spend);
  const overrides = applyBehaviorOverrides(behaviorOverrides);

  const featureRow = {
    spend_intensity,
    ...shares,
    ...overrides,
  };

  const featureVector = clusterFeatures.map((f) => featureRow[f] ?? 0);
  const scaled = scaleFeatures(featureVector, scalerCenter, scalerScale);
  const { bestIdx, bestDist } = findNearestCentroid(scaled, clusterCenters);

  return {
    cluster: bestIdx,
    distance: bestDist,
    spend4,
    shares,
    features_row: featureRow,
    profile: getClusterProfile(bestIdx),
  };
}

// ============================================================================
// DOM POPULATION HELPERS
// ============================================================================

/**
 * Populate template with cluster profile data
 * @param {HTMLElement} container - Container with template structure
 * @param {Object} profile - Cluster profile data
 * @param {Object} result - Classification result
 */
function populateClusterProfile(container, profile, result) {
  // Populate header
  const profileName = container.querySelector("#profileName");
  const clusterBadge = container.querySelector("#clusterBadge");
  const sizeBadge = container.querySelector("#profileSizeBadge");

  if (profileName) profileName.textContent = profile.name;
  if (clusterBadge) clusterBadge.textContent = `Cluster ${result.cluster}`;
  if (sizeBadge) sizeBadge.textContent = `${profile.size.percentage}%`;

  // Populate description
  const description = container.querySelector("#profileDescription");
  if (description) description.textContent = profile.description;

  // Populate characteristics
  const charsList = container.querySelector("#characteristicsList");
  if (charsList) {
    const fragment = document.createDocumentFragment();
    profile.characteristics.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = c;
      fragment.appendChild(li);
    });
    charsList.replaceChildren(fragment);
  }

  // Populate metrics
  const metricsList = container.querySelector("#metricsList");
  if (metricsList) {
    const fragment = document.createDocumentFragment();
    Object.entries(profile.metrics).forEach(([key, val]) => {
      const li = document.createElement("li");

      const labelSpan = document.createElement("span");
      labelSpan.className = "metric-label";
      labelSpan.textContent =
        key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()) + ":";
      li.appendChild(labelSpan);

      const valueSpan = document.createElement("span");
      const isNumber = typeof val === "number";
      const metricClass = isNumber
        ? val > 0
          ? "metric-positive"
          : val < 0
          ? "metric-negative"
          : "metric-neutral"
        : "metric-text";
      valueSpan.className = `metric-value ${metricClass}`;
      valueSpan.textContent = isNumber ? val.toFixed(2) : val;
      li.appendChild(valueSpan);

      fragment.appendChild(li);
    });
    metricsList.replaceChildren(fragment);
  }

  // Populate strategy
  const strategyText = container.querySelector("#strategyText");
  if (strategyText) strategyText.textContent = profile.strategy;

  // Populate meta information
  const metaDistance = container.querySelector("#metaDistance");
  const metaTotal = container.querySelector("#metaTotal");
  const metaPopulation = container.querySelector("#metaPopulation");

  if (metaDistance) metaDistance.textContent = result.distance.toFixed(3);
  if (metaTotal) metaTotal.textContent = `$${result.spend4.toFixed(2)}`;
  if (metaPopulation)
    metaPopulation.textContent = `${profile.size.count.toLocaleString()} customers`;

  // Apply cluster-specific class
  container.className = `cluster-profile cluster-${profile.id}`;
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

async function renderClusterPrediction() {
  const box = document.getElementById("clusterPrediction");
  if (!box || !window.cartAPI) return;
  const sample = window.cartAPI.toSegmentationSample();

  const baseResult = classifyCartClient(sample, {
    NumWebPurchases: 0,
    NumWebVisitsMonth: 0,
    web_share: 0,
    NumDealsPurchases: 0,
  });

  if (baseResult.error) {
    box.textContent = "Segment: " + baseResult.error;
    box.className = "segment-box segment-error";
    return;
  }

  const shouldBoostToCluster1 =
    baseResult.spend4 > 150 &&
    baseResult.shares.Wines_share > 0.75 &&
    baseResult.shares.Wines_share < 0.9;

  const boostedResult = shouldBoostToCluster1
    ? classifyCartClient(sample, {
        NumWebPurchases: 2,
        NumWebVisitsMonth: 6,
        web_share: 0.7,
        NumDealsPurchases: 2,
      })
    : baseResult;

  const result = boostedResult.error ? baseResult : boostedResult;
  const profile = result.profile;

  if (!profile) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "cluster-profile error";
    const strong = document.createElement("strong");
    strong.textContent = "Unknown Cluster:";
    errorDiv.appendChild(strong);
    errorDiv.appendChild(document.createTextNode(` ${result.cluster}`));
    box.replaceChildren(errorDiv);
    box.className = `segment-box segment-cluster-${result.cluster}`;
    return;
  }

  // Load template
  const templateHTML = await loadClusterTemplate();
  if (!templateHTML) {
    console.error("Could not load cluster profile template");
    box.textContent = "Error loading profile template";
    return;
  }

  // Create temporary container to parse template
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = templateHTML;
  const container = tempDiv.firstElementChild;

  if (!container) {
    console.error("Invalid cluster profile template");
    return;
  }

  // Populate template with data
  populateClusterProfile(container, profile, result);

  // Replace box content
  box.replaceChildren(container);
  box.className = `segment-box segment-cluster-${result.cluster}`;
}

// ============================================================================
// PUBLIC API & INITIALIZATION
// ============================================================================

// Export for use by other modules (e.g., checkout.js)
window.renderClusterPrediction = renderClusterPrediction;

document.addEventListener("DOMContentLoaded", renderClusterPrediction);
