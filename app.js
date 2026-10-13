// Connect to Supabase (Project Settings -> API Keys)
const SUPABASE_URL = 'https://ooargjglyhaaadrkdizl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ure_fwDuxOeG1dpR-c4t7w_ACwxt3wB';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('order-form');
const statusText = document.getElementById('status');
const ordersList = document.getElementById('orders-list');

// Product prices in dollars
const prices = {
    'Classic Notebook': 12,
    'Fountain Pen': 24,
    'Weekly Planner': 18,
    'Colored Pencils': 15
};

// Show the total price: price x quantity
function showTotal() {
    const price = prices[document.getElementById('product').value] || 0;
    const quantity = Number(document.getElementById('quantity').value);
    document.getElementById('total').textContent = 'Total: $' + price * quantity;
}
document.getElementById('product').addEventListener('change', showTotal);
document.getElementById('quantity').addEventListener('input', showTotal);

// "Order" button on a product card: choose the product in the form
function chooseProduct(product) {
    document.getElementById('product').value = product;
    showTotal();
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
}

// 1. Send the form data to the Supabase "orders" table
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const order = {
        name: document.getElementById('name').value,
        product: document.getElementById('product').value,
        quantity: Number(document.getElementById('quantity').value),
        message: document.getElementById('message').value
    };

    statusText.textContent = 'Sending...';
    const { error } = await db.from('orders').insert(order);

    if (error) {
        statusText.textContent = 'Error: ' + error.message;
        return;
    }

    statusText.textContent = 'Thank you! Your order was saved to the database.';
    form.reset();
    showTotal();
    loadOrders();
});

// 2. Read the latest orders from Supabase and show them in the table
async function loadOrders() {
    const { data, error } = await db
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        ordersList.innerHTML = '<tr><td colspan="5">Error: could not load orders</td></tr>';
        return;
    }
    if (data.length === 0) {
        ordersList.innerHTML = '<tr><td colspan="5">No orders yet.</td></tr>';
        return;
    }

    ordersList.innerHTML = '';
    for (const order of data) {
        const time = new Date(order.created_at).toLocaleString();
        const row = document.createElement('tr');
        // textContent (not innerHTML) so user text is shown as plain text
        for (const value of [time, order.name, order.product, order.quantity, order.message]) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        }
        ordersList.appendChild(row);
    }
}

loadOrders();
