# Paper Lane — Stationery Shop

Homepage assignment. Topic: **Online Market**.

**Website:** https://brevno-project.github.io/Keiin_lecture/

## How it works

1. The homepage is published with **GitHub Pages**.
2. A visitor fills in the order form (name, product, quantity, message).
3. `app.js` sends the data to the **Supabase** table `orders`.
4. The "Latest orders" table on the page reads the data back from Supabase, so you can see that the order was saved.

## Files

| File | What it does |
|---|---|
| `index.html` | Page content: products, order form, orders table |
| `style.css` | Design |
| `app.js` | Connects to Supabase, sends and reads orders |
| `supabase.sql` | SQL that creates the `orders` table |
| `img/` | Product photos |

## How to check

1. Open the website and fill in the form in **Place an order**.
2. Click **Send order**.
3. Your order appears in **Latest orders**, and in Supabase: **Table Editor → orders**.
