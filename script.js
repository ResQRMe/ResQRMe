/* ══════════════════════════════════════════════════
   RESQ ME — script.js
   ══════════════════════════════════════════════════ */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx-6b1yjrDO-Cs088Yh8y5QnfvH5Y5_-X6iu7SBhn4zlE2VbihTNPxJTyHm3TFs96rtLQ/exec";

/* ── Theme ── */
const themeToggle = document.getElementById("themeToggle");
let currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
document.documentElement.setAttribute("data-theme", currentTheme);
themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
});

/* ── Mobile nav ── */
const navToggle = document.getElementById("navToggle");
const mainNav   = document.querySelector(".main-nav");
if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.addEventListener("click", (e) => {
    if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ══════════════════════════════════════════
   PHOTO UPLOAD PREVIEW
═══════════════════════════════════════════ */
const photoInput       = document.getElementById("photo");
const photoPreview     = document.getElementById("photoPreview");
const photoPlaceholder = document.getElementById("photoPlaceholder");
const removePhotoBtn   = document.getElementById("removePhoto");

if (photoInput) {
  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.src = e.target.result;
      photoPreview.classList.add("visible");
      photoPlaceholder.style.display = "none";
      removePhotoBtn.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  removePhotoBtn.addEventListener("click", () => {
    photoInput.value = "";
    photoPreview.src = "";
    photoPreview.classList.remove("visible");
    photoPlaceholder.style.display = "flex";
    removePhotoBtn.style.display = "none";
  });
}

/* ══════════════════════════════════════════
   AGE AUTO-CALCULATE FROM DOB
═══════════════════════════════════════════ */
const dobInput = document.getElementById("dob");
const ageInput = document.getElementById("age");

if (dobInput && ageInput) {
  dobInput.addEventListener("change", calcAge);

  function calcAge() {
    const dob = new Date(dobInput.value);
    if (isNaN(dob.getTime())) { ageInput.value = ""; return; }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    ageInput.value = age >= 0 ? age : "";
  }
}

/* ══════════════════════════════════════════
   CONDITIONAL YES/NO PANELS
═══════════════════════════════════════════ */
const conditionalMap = {
  allergies_yn:   "allergies_detail",
  medications_yn: "medications_detail",
  chronic_yn:     "chronic_detail",
  history_yn:     "history_detail",
  insurance_yn:   "insurance_detail",
  pcp_yn:         "pcp_detail",
};

Object.entries(conditionalMap).forEach(([radioName, panelId]) => {
  const radios = document.querySelectorAll(`input[name="${radioName}"]`);
  const panel  = document.getElementById(panelId);
  if (!radios.length || !panel) return;

  function updatePanel() {
    const checked = Array.from(radios).find((r) => r.checked);
    const show = checked && checked.value === "Yes";
    panel.classList.toggle("is-visible", show);
    panel.querySelectorAll("input, textarea").forEach((el) => {
      el.required = show;
      if (!show) el.value = "";
    });
  }

  radios.forEach((radio) => radio.addEventListener("change", updatePanel));
  updatePanel();
});

/* ══════════════════════════════════════════
   MULTI-STEP FORM
═══════════════════════════════════════════ */
let currentStep = 1;
const totalSteps = 4;

function goToStep(n) {
  // Hide all
  document.querySelectorAll(".form-step").forEach((s) => s.classList.remove("active"));
  // Show target
  const target = document.getElementById(`step${n}`);
  if (target) target.classList.add("active");

  // Update progress bar
  const fill = document.getElementById("stepFill");
  if (fill) fill.style.width = `${(n / totalSteps) * 100}%`;

  // Update step labels
  document.querySelectorAll(".step-label").forEach((lbl) => {
    const s = parseInt(lbl.dataset.step);
    lbl.classList.remove("active", "done");
    if (s === n) lbl.classList.add("active");
    else if (s < n) lbl.classList.add("done");
  });

  currentStep = n;

  // Build review on step 4
  if (n === 4) buildReview();

  // Scroll to top of reg section
  const regSection = document.getElementById("register");
  if (regSection) regSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Validate step 1 */
function validateStep1() {
  let ok = true;
  const name = document.getElementById("full_name");
  const dob  = document.getElementById("dob");

  clearError("err_full_name"); clearError("err_dob");
  name.classList.remove("invalid"); dob.classList.remove("invalid");

  if (!name.value.trim()) {
    showError("err_full_name", "Full name is required.");
    name.classList.add("invalid"); ok = false;
  }
  if (!dob.value) {
    showError("err_dob", "Date of birth is required.");
    dob.classList.add("invalid"); ok = false;
  }
  return ok;
}

/* Validate step 2 */
function validateStep2() {
  let ok = true;
  const yns = ["allergies_yn", "medications_yn", "chronic_yn", "history_yn"];
  yns.forEach((name) => {
    clearError(`err_${name}`);
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      showError(`err_${name}`, "Please select Yes or No.");
      ok = false;
    }
  });
  return ok;
}

/* Validate step 3 */
function validateStep3() {
  let ok = true;
  ["insurance_yn", "pcp_yn"].forEach((name) => {
    clearError(`err_${name}`);
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    if (!checked) {
      showError(`err_${name}`, "Please select Yes or No.");
      ok = false;
    }
  });
  return ok;
}

/* Navigation buttons */
document.getElementById("toStep2")?.addEventListener("click", () => { if (validateStep1()) goToStep(2); });
document.getElementById("toStep3")?.addEventListener("click", () => { if (validateStep2()) goToStep(3); });
document.getElementById("toStep4")?.addEventListener("click", () => { if (validateStep3()) goToStep(4); });
document.getElementById("toStep1Back")?.addEventListener("click", () => goToStep(1));
document.getElementById("toStep2Back")?.addEventListener("click", () => goToStep(2));
document.getElementById("toStep3Back")?.addEventListener("click", () => goToStep(3));

/* ── Review builder ── */
function buildReview() {
  const summary = document.getElementById("reviewSummary");
  if (!summary) return;

  const get = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() || "—" : "—";
  };
  const getRadio = (name) => {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : "—";
  };
  const getSelect = (id) => {
    const el = document.getElementById(id);
    return el ? (el.options[el.selectedIndex]?.text || "—") : "—";
  };

  const rows = [
    ["Full Name",          get("full_name")],
    ["Preferred Name",     get("preferred_name")],
    ["Date of Birth",      get("dob")],
    ["Age",                get("age")],
    ["Sex / Gender",       getSelect("sex")],
    ["Occupation",         get("occupation")],
    ["Blood Type",         getSelect("blood_type")],
    ["Phone",              get("phone")],
    ["Email",              get("email")],
    ["Address",            get("address")],
    ["Emergency Contact",  get("emergency_name")],
    ["Emergency Phone",    get("emergency_phone")],
    ["Allergies",          getRadio("allergies_yn")],
    ["Medications",        getRadio("medications_yn")],
    ["Chronic Conditions", getRadio("chronic_yn")],
    ["Medical History",    getRadio("history_yn")],
    ["Health Insurance",   getRadio("insurance_yn")],
    ["Primary Care",       getRadio("pcp_yn")],
  ];

  summary.innerHTML = rows.map(([label, val]) =>
    `<div class="review-row">
      <span class="r-label">${label}</span>
      <span class="r-val">${val}</span>
    </div>`
  ).join("");
}

/* ══════════════════════════════════════════
   PATIENT FORM SUBMIT
═══════════════════════════════════════════ */
const patientForm    = document.getElementById("patientForm");
const statusBox      = document.getElementById("statusBox");
const patientIdText  = document.getElementById("patientIdText");
const recordLink     = document.getElementById("recordLink");
const qrImage        = document.getElementById("qrImage");
const qrPlaceholder  = document.getElementById("qrPlaceholder");
const submitBtn      = document.getElementById("submitBtn");
const submitBtnText  = document.getElementById("submitBtnText");
const submitSpinner  = document.getElementById("submitSpinner");
const successOverlay = document.getElementById("successOverlay");
const successPatientId   = document.getElementById("successPatientId");
const successRecordLink  = document.getElementById("successRecordLink");
const successDismiss     = document.getElementById("successDismiss");

if (patientForm) {
  patientForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Set loading state
    statusBox.textContent = "Saving patient record…";
    submitBtnText.textContent = "Saving…";
    submitSpinner.style.display = "inline-block";
    submitBtn.disabled = true;
    patientIdText.textContent = "—";
    recordLink.textContent = "—";
    recordLink.removeAttribute("href");
    qrImage.style.display = "none";
    if (qrPlaceholder) qrPlaceholder.style.display = "block";

    try {
      const formData = new FormData(patientForm);
      const get = (key) => formData.get(key) || "";

      const payload = {
        full_name:              get("full_name"),
        preferred_name:         get("preferred_name"),
        sex:                    get("sex"),
        dob:                    get("dob"),
        age:                    get("age"),
        occupation:             get("occupation"),
        blood_type:             get("blood_type"),
        address:                get("address"),
        phone:                  get("phone"),
        email:                  get("email"),
        emergency_name:         get("emergency_name"),
        emergency_relationship: get("emergency_relationship"),
        emergency_phone:        get("emergency_phone"),
        allergies_yn:           get("allergies_yn") || "No",
        medications_yn:         get("medications_yn") || "No",
        chronic_yn:             get("chronic_yn") || "No",
        history_yn:             get("history_yn") || "No",
        insurance_yn:           get("insurance_yn") || "No",
        pcp_yn:                 get("pcp_yn") || "No",
      };

      if (payload.allergies_yn   === "Yes") payload.allergies          = get("allergies");
      if (payload.medications_yn === "Yes") payload.medications        = get("medications");
      if (payload.chronic_yn     === "Yes") payload.chronic_conditions = get("chronic_conditions");
      if (payload.history_yn     === "Yes") payload.history            = get("history");
      if (payload.insurance_yn   === "Yes") {
        payload.insurance_provider = get("insurance_provider");
        payload.insurance_policy   = get("insurance_policy");
      }
      if (payload.pcp_yn === "Yes") {
        payload.pcp_name    = get("pcp_name");
        payload.pcp_contact = get("pcp_contact");
      }

      payload.photo_base64 = await fileToBase64(photoInput?.files[0] || null);

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Save failed.");

      // Update result panel
      patientIdText.textContent = result.patient_id;
      recordLink.href = result.record_url;
      recordLink.textContent = result.record_url;
      qrImage.src = result.qr_url;
      qrImage.style.display = "block";
      if (qrPlaceholder) qrPlaceholder.style.display = "none";
      statusBox.textContent = "✅ Patient saved successfully. QR code generated.";

      // Auto-fill Order Form Patient ID
      const orderPatientId = document.getElementById("order_patient_id");
      if (orderPatientId) orderPatientId.value = result.patient_id;

      // Show success overlay
      if (successPatientId) successPatientId.textContent = result.patient_id;
      if (successRecordLink) { successRecordLink.href = result.record_url; }
      if (successOverlay) successOverlay.style.display = "flex";

    } catch (error) {
      statusBox.textContent = "Error: " + error.message;
    } finally {
      submitBtnText.textContent = "Save Patient Record";
      submitSpinner.style.display = "none";
      submitBtn.disabled = false;
    }
  });

  // Clear form reset
  patientForm.addEventListener("reset", () => {
    Object.values(conditionalMap).forEach((panelId) => {
      const panel = document.getElementById(panelId);
      if (panel) {
        panel.classList.remove("is-visible");
        panel.querySelectorAll("input, textarea").forEach((el) => { el.required = false; el.value = ""; });
      }
    });
    if (photoPreview) { photoPreview.classList.remove("visible"); photoPreview.src = ""; }
    if (photoPlaceholder) photoPlaceholder.style.display = "flex";
    if (removePhotoBtn) removePhotoBtn.style.display = "none";
    goToStep(1);
  });
}

// Dismiss success overlay
successDismiss?.addEventListener("click", () => {
  if (successOverlay) successOverlay.style.display = "none";
});

/* ══════════════════════════════════════════
   ORDER FORM
═══════════════════════════════════════════ */
const orderForm         = document.getElementById("orderForm");
const orderProduct      = document.getElementById("order_product");
const orderQuantity     = document.getElementById("order_quantity");
const priceDisplay      = document.getElementById("priceDisplay");
const priceValue        = document.getElementById("priceValue");
const orderTotalHidden  = document.getElementById("order_total_hidden");
const orderPayment      = document.getElementById("order_payment");
const gcashDetail       = document.getElementById("gcash_detail");
const orderSubmitBtn    = document.getElementById("orderSubmitBtn");
const orderBtnText      = document.getElementById("orderBtnText");
const orderSpinner      = document.getElementById("orderSpinner");
const orderSuccess      = document.getElementById("orderSuccess");
const orderSuccessDismiss = document.getElementById("orderSuccessDismiss");

/* Price calculation */
function updatePrice() {
  const selected = orderProduct?.options[orderProduct.selectedIndex];
  if (!selected || !selected.dataset.price) { if (priceDisplay) priceDisplay.style.display = "none"; return; }
  const unitPrice = parseInt(selected.dataset.price);
  const qty       = parseInt(orderQuantity?.value) || 1;
  const total     = unitPrice * qty;
  if (priceDisplay) priceDisplay.style.display = "flex";
  if (priceValue) priceValue.textContent = total === 0 ? "FREE" : `₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  if (orderTotalHidden) orderTotalHidden.value = total === 0 ? "FREE" : `PHP ${total.toFixed(2)}`;
}

orderProduct?.addEventListener("change", updatePrice);
orderQuantity?.addEventListener("input", updatePrice);

/* GCash / Maya reveal */
orderPayment?.addEventListener("change", () => {
  const val = orderPayment.value;
  if (gcashDetail) {
    if (val === "GCash" || val === "Maya") {
      gcashDetail.classList.add("is-visible");
    } else {
      gcashDetail.classList.remove("is-visible");
      const ref = document.getElementById("order_gcash_ref");
      if (ref) ref.value = "";
    }
  }
});

/* Order form validation */
function validateOrderForm() {
  let ok = true;
  const fields = [
    { id: "order_product",  errId: "err_order_product",  msg: "Please select a product." },
    { id: "order_name",     errId: "err_order_name",     msg: "Full name is required." },
    { id: "order_patient_id", errId: "err_order_patient_id", msg: "Patient ID is required." },
    { id: "order_email",    errId: "err_order_email",    msg: "Email address is required." },
    { id: "order_payment",  errId: "err_order_payment",  msg: "Please select a payment method." },
    { id: "order_address",  errId: "err_order_address",  msg: "Shipping address is required." },
  ];

  fields.forEach(({ id, errId, msg }) => {
    clearError(errId);
    const el = document.getElementById(id);
    if (el) el.classList.remove("invalid");
    if (!el || !el.value.trim()) {
      showError(errId, msg);
      if (el) el.classList.add("invalid");
      ok = false;
    }
  });

  // Email format
  const emailEl = document.getElementById("order_email");
  if (emailEl && emailEl.value && !emailEl.value.includes("@")) {
    showError("err_order_email", "Please enter a valid email.");
    emailEl.classList.add("invalid"); ok = false;
  }

  return ok;
}

/* Order submit — uses Web3Forms (native HTML submit) */
if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateOrderForm()) return;

    orderBtnText.textContent = "Submitting…";
    orderSpinner.style.display = "inline-block";
    orderSubmitBtn.disabled = true;

    try {
      const formData = new FormData(orderForm);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        orderForm.querySelectorAll("input:not([type=hidden]), select, textarea").forEach((el) => { el.value = ""; });
        if (priceDisplay) priceDisplay.style.display = "none";
        if (gcashDetail) gcashDetail.classList.remove("is-visible");
        orderSuccess.style.display = "block";
      } else {
        throw new Error(result.message || "Submission failed.");
      }
    } catch (err) {
      alert("Order error: " + err.message);
    } finally {
      orderBtnText.textContent = "Submit Order";
      orderSpinner.style.display = "none";
      orderSubmitBtn.disabled = false;
    }
  });

  orderSuccessDismiss?.addEventListener("click", () => {
    orderSuccess.style.display = "none";
  });
}

/* ══════════════════════════════════════════
   IMAGE MODAL
═══════════════════════════════════════════ */
const previewImages    = document.querySelectorAll(".product-preview-image");
const imageModal       = document.getElementById("imageModal");
const imageModalPreview = document.getElementById("imageModalPreview");
const imageModalClose  = document.getElementById("imageModalClose");

previewImages.forEach((img) => img.addEventListener("click", () => openImageModal(img)));
imageModal?.addEventListener("click", (e) => { if (e.target === imageModal) closeImageModal(); });
imageModalClose?.addEventListener("click", closeImageModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeImageModal();
});

function openImageModal(img) {
  imageModalPreview.src = img.src;
  imageModalPreview.alt = img.alt;
  imageModal.classList.add("is-open");
  imageModal.setAttribute("aria-hidden", "false");
}
function closeImageModal() {
  imageModal?.classList.remove("is-open");
  imageModal?.setAttribute("aria-hidden", "true");
  if (imageModalPreview) imageModalPreview.removeAttribute("src");
}

/* ══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(""); return; }
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = "";
}

document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  // your validation / API / order logic here

  // if order is successful:
  window.location.href = "order_success.html";
});

document.getElementById("orderForm").addEventListener("submit", function () {
  setTimeout(function () {
    window.location.href = "order_success.html";
  }, 1000);
});