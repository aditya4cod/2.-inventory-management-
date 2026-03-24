// --- State Management ---
let inventory = [];        // Array to hold items
let editIndex = null;      // Tracks if we are editing an existing item

// --- Load Data from Browser Storage ---
function loadInventory() {
    const stored = localStorage.getItem('inventoryData');
    inventory = stored ? JSON.parse(stored) : [];
    renderTable();
}

// --- Save Data to Browser Storage ---
function saveInventory() {
    localStorage.setItem('inventoryData', JSON.stringify(inventory));
}

// --- Format Number as Indian Rupees (₹) ---
function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// --- Render Table & Summary ---
function renderTable(filterText = '') {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    let totalUnits = 0;
    let totalValue = 0;
    let visibleCount = 0;

    inventory.forEach((item, index) => {
        // Search filter
        if (filterText && !item.name.toLowerCase().includes(filterText.toLowerCase())) return;

        visibleCount++;
        totalUnits += parseInt(item.qty);
        totalValue += parseInt(item.qty) * parseFloat(item.price);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>${formatINR(item.price)}</td>
            <td>${formatINR(item.qty * item.price)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="startEdit(${index})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteItem(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update Summary
    document.getElementById('totalUnits').textContent = totalUnits;
    document.getElementById('totalValue').textContent = formatINR(totalValue);
}

// --- Add or Update Item ---
document.getElementById('itemForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value.trim();
    const qty = parseInt(document.getElementById('itemQty').value);
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (!name || isNaN(qty) || isNaN(price)) {
        alert("Please fill all fields correctly.");
        return;
    }

    if (editIndex !== null) {
        // Update existing
        inventory[editIndex] = { name, qty, price };
        editIndex = null;
        resetForm();
    } else {
        // Add new
        inventory.push({ name, qty, price });
    }

    saveInventory();
    renderTable(document.getElementById('searchBox').value.toLowerCase());
});

// --- Start Edit Mode ---
function startEdit(index) {
    const item = inventory[index];
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemQty').value = item.qty;
    document.getElementById('itemPrice').value = item.price;

    editIndex = index;
    document.getElementById('saveBtn').textContent = 'Update Item';
    document.getElementById('cancelBtn').style.display = 'block';
}

// --- Delete Item ---
function deleteItem(index) {
    if (confirm(`Delete "${inventory[index].name}" from inventory?`)) {
        inventory.splice(index, 1);
        saveInventory();
        renderTable(document.getElementById('searchBox').value.toLowerCase());
        
        // If we were editing the deleted item, reset form
        if (editIndex === index) resetForm();
    }
}

// --- Reset Form to "Add" Mode ---
function resetForm() {
    document.getElementById('itemForm').reset();
    editIndex = null;
    document.getElementById('saveBtn').textContent = 'Add Item';
    document.getElementById('cancelBtn').style.display = 'none';
}

// --- Cancel Edit Button ---
document.getElementById('cancelBtn').addEventListener('click', resetForm);

// --- Live Search ---
document.getElementById('searchBox').addEventListener('input', function(e) {
    renderTable(e.target.value.toLowerCase());
});

// --- Initialize App on Load ---
loadInventory();