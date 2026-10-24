

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const PORT = 3005;
const DATA_FILE = path.join(__dirname, 'data.json');


// Send JSON response
function send(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body, null, 2));
}


// Read JSON body from request
async function readBody(req) {
    let raw = '';

    for await (const chunk of req) {
        raw += chunk;
    }

    return JSON.parse(raw || '{}');
}


// Read saved data from data.json
async function readData() {
    const file = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(file);
}


// Save data to data.json
async function saveData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}


// Get ID from URL such as /products/1
function getId(url) {
    return Number(url.split('/')[2]);
}


const server = http.createServer(async function (req, res) {

    try {
        const data = await readData();


        // =====================================================
        // PRODUCTS
        // =====================================================

        // GET all products
        if (req.method === 'GET' && req.url === '/products') {
            return send(res, 200, data.products);
        }

        // GET one product
        if (req.method === 'GET' && req.url.startsWith('/products/')) {
            const id = getId(req.url);
            const product = data.products.find(function (item) {
                return item.id === id;
            });

            if (!product) {
                return send(res, 404, { error: 'Product not found' });
            }

            return send(res, 200, product);
        }

        // POST new product
        if (req.method === 'POST' && req.url === '/products') {
            const body = await readBody(req);

            if (!body.name || body.price === undefined) {
                return send(res, 400, {
                    error: 'Product name and price are required'
                });
            }

            const newProduct = {
                id: data.nextProductId,
                name: body.name,
                price: body.price,
                category: body.category || 'General'
            };

            data.nextProductId++;
            data.products.push(newProduct);

            await saveData(data);

            return send(res, 201, newProduct);
        }

        // PUT update product
        if (req.method === 'PUT' && req.url.startsWith('/products/')) {
            const id = getId(req.url);

            const product = data.products.find(function (item) {
                return item.id === id;
            });

            if (!product) {
                return send(res, 404, { error: 'Product not found' });
            }

            const body = await readBody(req);

            if (body.name !== undefined) {
                product.name = body.name;
            }

            if (body.price !== undefined) {
                product.price = body.price;
            }

            if (body.category !== undefined) {
                product.category = body.category;
            }

            await saveData(data);

            return send(res, 200, product);
        }

        // DELETE product
        if (req.method === 'DELETE' && req.url.startsWith('/products/')) {
            const id = getId(req.url);

            const index = data.products.findIndex(function (item) {
                return item.id === id;
            });

            if (index === -1) {
                return send(res, 404, { error: 'Product not found' });
            }

            const deletedProduct = data.products.splice(index, 1)[0];

            await saveData(data);

            return send(res, 200, {
                message: 'Product deleted',
                product: deletedProduct
            });
        }


        // =====================================================
        // SIGNUP / LOGIN
        // =====================================================

        // POST signup
        if (req.method === 'POST' && req.url === '/signup') {
            const body = await readBody(req);

            if (!body.name || !body.email || !body.password) {
                return send(res, 400, {
                    error: 'Name, email and password are required'
                });
            }

            const existingUser = data.users.find(function (user) {
                return user.email === body.email;
            });

            if (existingUser) {
                return send(res, 400, {
                    error: 'Email already exists'
                });
            }

            const newUser = {
                id: data.nextUserId,
                name: body.name,
                email: body.email,
                password: body.password
            };

            data.nextUserId++;
            data.users.push(newUser);

            await saveData(data);

            return send(res, 201, {
                message: 'Signup successful',
                user: newUser
            });
        }

        // POST login
        if (req.method === 'POST' && req.url === '/login') {
            const body = await readBody(req);

            const user = data.users.find(function (item) {
                return item.email === body.email &&
                    item.password === body.password;
            });

            if (!user) {
                return send(res, 401, {
                    error: 'Invalid email or password'
                });
            }

            return send(res, 200, {
                message: 'Login successful',
                user: user
            });
        }


        // =====================================================
        // CART
        // =====================================================

        // GET cart
        if (req.method === 'GET' && req.url === '/cart') {
            return send(res, 200, data.cart);
        }

        // POST add item to cart
        if (req.method === 'POST' && req.url === '/cart') {
            const body = await readBody(req);

            const product = data.products.find(function (item) {
                return item.id === body.productId;
            });

            if (!product) {
                return send(res, 404, {
                    error: 'Product not found'
                });
            }

            const cartItem = {
                id: data.nextCartId,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: body.quantity || 1
            };

            data.nextCartId++;
            data.cart.push(cartItem);

            await saveData(data);

            return send(res, 201, {
                message: 'Product added to cart',
                item: cartItem
            });
        }

        // PUT edit cart quantity
        if (req.method === 'PUT' && req.url.startsWith('/cart/')) {
            const id = getId(req.url);

            const item = data.cart.find(function (cartItem) {
                return cartItem.id === id;
            });

            if (!item) {
                return send(res, 404, {
                    error: 'Cart item not found'
                });
            }

            const body = await readBody(req);

            if (body.quantity === undefined || body.quantity < 1) {
                return send(res, 400, {
                    error: 'Valid quantity is required'
                });
            }

            item.quantity = body.quantity;

            await saveData(data);

            return send(res, 200, item);
        }

        // DELETE item from cart
        if (req.method === 'DELETE' && req.url.startsWith('/cart/')) {
            const id = getId(req.url);

            const index = data.cart.findIndex(function (cartItem) {
                return cartItem.id === id;
            });

            if (index === -1) {
                return send(res, 404, {
                    error: 'Cart item not found'
                });
            }

            const deletedItem = data.cart.splice(index, 1)[0];

            await saveData(data);

            return send(res, 200, {
                message: 'Item removed from cart',
                item: deletedItem
            });
        }


        // =====================================================
        // REVIEWS
        // =====================================================

        // GET reviews
        if (req.method === 'GET' && req.url === '/reviews') {
            return send(res, 200, data.reviews);
        }

        // POST review
        if (req.method === 'POST' && req.url === '/reviews') {
            const body = await readBody(req);

            if (!body.name || !body.comment) {
                return send(res, 400, {
                    error: 'Name and comment are required'
                });
            }

            const review = {
                id: data.nextReviewId,
                name: body.name,
                comment: body.comment,
                rating: body.rating || 5
            };

            data.nextReviewId++;
            data.reviews.push(review);

            await saveData(data);

            return send(res, 201, review);
        }


        // =====================================================
        // CHECKOUT / ORDERS
        // =====================================================

        // GET all orders
        if (req.method === 'GET' && req.url === '/orders') {
            return send(res, 200, data.orders);
        }

        // POST checkout
        if (req.method === 'POST' && req.url === '/checkout') {
            const body = await readBody(req);

            if (!body.customerName || !body.address) {
                return send(res, 400, {
                    error: 'Customer name and address are required'
                });
            }

            if (data.cart.length === 0) {
                return send(res, 400, {
                    error: 'Cart is empty'
                });
            }

            let total = 0;

            data.cart.forEach(function (item) {
                total += item.price * item.quantity;
            });

            const order = {
                id: data.nextOrderId,
                customerName: body.customerName,
                address: body.address,
                items: data.cart,
                total: total,
                status: 'Placed'
            };

            data.nextOrderId++;
            data.orders.push(order);

            // Empty cart after checkout
            data.cart = [];

            await saveData(data);

            return send(res, 201, {
                message: 'Order placed successfully',
                order: order
            });
        }


        // ROUTE NOT FOUND
        return send(res, 404, {
            error: 'Route not found'
        });

    } catch (error) {

        if (error instanceof SyntaxError) {
            return send(res, 400, {
                error: 'Invalid JSON'
            });
        }

        console.error(error);

        return send(res, 500, {
            error: 'Server error'
        });
    }

});


server.listen(PORT, function () {
    console.log('E-commerce Persistent API running at http://localhost:' + PORT);
});
