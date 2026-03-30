const API_BASE_URL = "http://localhost:8080";

// Grab token from URL if redirecting from Google Auth
const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get('token');
if (urlToken) {
    localStorage.setItem("jwt_token", urlToken);
    // Clean up the URL so the huge token string is removed
    window.history.replaceState({}, document.title, window.location.pathname);
}

const jwtToken = localStorage.getItem("jwt_token");

const UNITS = {
    LengthUnit: ["FEET", "INCH", "YARD", "CENTIMETER"],
    WeightUnit: ["KILOGRAM", "GRAM", "POUND"],
    VolumeUnit: ["LITRE", "MILLILITRE", "GALLON"],
    TemperatureUnit: ["CELSIUS", "FAHRENHEIT", "KELVIN"]
};

// State
let activeType = "LengthUnit";
let activeOp = "convert";

// DOM Elements
const typeTabs = document.querySelectorAll(".type-tab");
const opBtns = document.querySelectorAll(".op-btn");
const unit1 = document.getElementById("unit1");
const unit2 = document.getElementById("unit2");
const val1 = document.getElementById("val1");
const val2 = document.getElementById("val2");
const q2ValueGroup = document.getElementById("q2-value-group");
const actionBtn = document.getElementById("action-btn");
const resultBox = document.getElementById("resultBox");

// Initialize
populateUnits(activeType);

// Event Listeners for Types
typeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        typeTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        activeType = tab.getAttribute("data-type");
        populateUnits(activeType);
        checkSupportForTemperature();
    });
});

// Event Listeners for Operations
opBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        opBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeOp = btn.getAttribute("data-op");
        updateUIForOperation();
    });
});

function populateUnits(type) {
    unit1.innerHTML = "";
    unit2.innerHTML = "";
    UNITS[type].forEach(unit => {
        unit1.innerHTML += `<option value="${unit}">${unit}</option>`;
        unit2.innerHTML += `<option value="${unit}">${unit}</option>`;
    });
    
    // Pick different defaults if possible
    if(UNITS[type].length > 1) {
        unit2.selectedIndex = 1; 
    }
}

function updateUIForOperation() {
    resultBox.style.display = "none";
    
    if (activeOp === "convert") {
        q2ValueGroup.style.display = "none";
        actionBtn.innerText = "Convert Quantity";
    } else {
        q2ValueGroup.style.display = "block";
        const opName = activeOp.charAt(0).toUpperCase() + activeOp.slice(1);
        actionBtn.innerText = `${opName} Quantities`;
    }

    checkSupportForTemperature();
}

function checkSupportForTemperature() {
    // Backend doesn't support temp operations like add/subtract easily.
    // However, the backend throws an UnsupportedOperationException if called.
}

actionBtn.addEventListener("click", async () => {
    const v1 = parseFloat(val1.value);
    const u1 = unit1.value;
    
    const v2 = activeOp === "convert" ? 0 : parseFloat(val2.value);
    const u2 = unit2.value;

    if (isNaN(v1) || (activeOp !== "convert" && isNaN(v2))) {
        showResult("Please enter valid numerical values.", true);
        return;
    }

    const payload = {
        thisQuantityDTO: {
            value: v1,
            unit: u1,
            measurementType: activeType
        },
        thatQuantityDTO: {
            value: v2,
            unit: u2,
            measurementType: activeType
        }
    };

    try {
        actionBtn.innerText = "Processing...";
        const res = await fetch(`${API_BASE_URL}/api/v1/quantities/${activeOp}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(jwtToken && { "Authorization": `Bearer ${jwtToken}` })
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Server Error");

        const data = await res.json();
        
        if (data.error) {
            showResult(data.errorMessage, true);
        } else {
            displaySuccess(data);
        }
    } catch (e) {
        showResult("Failed to connect to backend engine. Ensure it's running on port 8080.", true);
    } finally {
        updateUIForOperation(); // Resets button text
    }
});

function displaySuccess(data) {
    let message = "";
    switch (activeOp) {
        case "convert":
            message = `${data.thisValue} ${data.thisUnit} = <span style="color:var(--primary)">${data.resultValue.toFixed(4)} ${data.resultUnit}</span>`;
            break;
        case "compare":
            message = data.resultString === "true" ? 
                `The quantities are <span style="color:#34D399">EQUAL</span>.` : 
                `The quantities are <span style="color:#F87171">NOT EQUAL</span>.`;
            break;
        case "add":
        case "subtract":
            message = `Result: <span style="color:var(--primary)">${data.resultValue.toFixed(3)} ${data.resultUnit}</span>`;
            break;
        case "divide":
            message = `Ratio Result: <span style="color:var(--primary)">${Number(data.resultValue).toFixed(4)}</span>`;
            break;
    }
    showResult(message, false);
}

function showResult(html, isError) {
    resultBox.innerHTML = html;
    resultBox.style.display = "block";
    if (isError) {
        resultBox.classList.add("error-box");
        resultBox.style.color = "#FCA5A5";
        resultBox.style.borderColor = "#FCA5A5";
        resultBox.style.background = "rgba(239, 68, 68, 0.1)";
    } else {
        resultBox.classList.remove("error-box");
        resultBox.style.color = "var(--text-main)";
        resultBox.style.borderColor = "var(--primary)";
        resultBox.style.background = "rgba(79, 70, 229, 0.1)";
    }
}
