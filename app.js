const TABLE = 'orders';

const form = document.getElementById('order-form');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('form-status');
const ordersBody = document.getElementById('orders-body');
const refreshBtn = document.getElementById('refresh-btn');

const configured =
    window.SUPABASE_URL && !window.SUPABASE_URL.includes('YOUR-PROJECT') &&
    window.SUPABASE_KEY && !window.SUPABASE_KEY.includes('YOUR-');

const db = configured ? supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY) : null;

function setStatus(text, type) {
    statusEl.textContent = text;
    statusEl.className = 'status' + (type ? ' ' + type : '');
}

function showTableMessage(text) {
    ordersBody.innerHTML = '';
    const row = ordersBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.className = 'muted';
    cell.textContent = text;
}

function formatTime(iso) {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

// Read the latest orders from Supabase
async function loadOrders(highlightFirst = false) {
    if (!db) {
        showTableMessage('Supabase is not configured yet: fill in config.js.');
        return;
    }

    const { data, error } = await db
        .from(TABLE)
        .select('id, created_at, customer_name, product, quantity')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error(error);
        showTableMessage('Could not load orders: ' + error.message);
        return;
    }
    if (data.length === 0) {
        showTableMessage('No orders yet. Be the first!');
        return;
    }

    ordersBody.innerHTML = '';
    data.forEach((order, i) => {
        const row = ordersBody.insertRow();
        if (highlightFirst && i === 0) row.className = 'fresh';
        row.insertCell().textContent = formatTime(order.created_at);
        row.insertCell().textContent = order.customer_name;
        row.insertCell().textContent = order.product;
        const qty = row.insertCell();
        qty.className = 'num';
        qty.textContent = order.quantity;
    });
}

function validate(order) {
    const errors = [];
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    if (!order.customer_name) errors.push('customer_name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email)) errors.push('email');
    if (!order.product) errors.push('product');
    if (!Number.isInteger(order.quantity) || order.quantity < 1 || order.quantity > 20) errors.push('quantity');

    errors.forEach(id => document.getElementById(id).classList.add('invalid'));
    return errors.length === 0;
}

// Send a new order to Supabase
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const order = {
        customer_name: form.customer_name.value.trim(),
        email: form.email.value.trim(),
        product: form.product.value,
        quantity: Number(form.quantity.value),
        message: form.message.value.trim() || null
    };

    if (!validate(order)) {
        setStatus('Please check the highlighted fields.', 'err');
        return;
    }
    if (!db) {
        setStatus('Supabase is not configured yet: fill in config.js.', 'err');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    setStatus('');

    const { error } = await db.from(TABLE).insert(order);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send order';

    if (error) {
        console.error(error);
        setStatus('Something went wrong: ' + error.message, 'err');
        return;
    }

    setStatus(`Thank you, ${order.customer_name}! Your order was saved to the database.`, 'ok');
    form.reset();
    await loadOrders(true);
    document.getElementById('orders').scrollIntoView({ behavior: 'smooth' });
});

// "Order" buttons on product cards preselect the product in the form
document.querySelectorAll('[data-product]').forEach(btn => {
    btn.addEventListener('click', () => {
        form.product.value = btn.dataset.product;
        document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        form.customer_name.focus({ preventScroll: true });
    });
});

refreshBtn.addEventListener('click', () => loadOrders());

loadOrders();
