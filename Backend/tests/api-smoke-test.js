require("dotenv").config();

const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;
const PASSWORD = process.env.SMOKE_PASSWORD || "StrongPass123!";
const RUN_ID = Date.now();

const state = {};

const expect = (condition, message) => {
    if (!condition) {
        throw new Error(message);
    }
};

const request = async (method, path, { token, body } = {}) => {
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token
                ? { Authorization: `Bearer ${token}` }
                : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });

    let json = null;

    try {
        json = await response.json();
    } catch (error) {
        json = null;
    }

    return {
        status: response.status,
        json
    };
};

const registerAndLogin = async (role) => {
    const email = `smoke_${role}_${RUN_ID}@example.com`;
    const name = `Smoke ${role} ${RUN_ID}`;

    const registerResponse = await request("POST", "/api/auth/register", {
        body: {
            name,
            email,
            password: PASSWORD,
            role
        }
    });

    expect(
        registerResponse.status === 201,
        `Register ${role} failed: ${JSON.stringify(registerResponse.json)}`
    );

    const loginResponse = await request("POST", "/api/auth/login", {
        body: {
            email,
            password: PASSWORD
        }
    });

    expect(
        loginResponse.status === 200 && loginResponse.json?.token,
        `Login ${role} failed: ${JSON.stringify(loginResponse.json)}`
    );

    return {
        email,
        token: loginResponse.json.token
    };
};

const getProduct = async (token, productId) => {
    const response = await request("GET", `/api/products/${productId}`, {
        token
    });

    expect(response.status === 200, `Fetch product ${productId} failed`);
    return response.json.product;
};

const getMovements = async (token, productId) => {
    const response = await request(
        "GET",
        `/api/products/${productId}/movements`,
        { token }
    );

    expect(
        response.status === 200,
        `Fetch movements ${productId} failed`
    );

    return response.json.movements;
};

const main = async () => {
    console.log(`Running smoke test against ${BASE_URL}`);

    const admin = await registerAndLogin("admin");
    const sales = await registerAndLogin("sales");
    const warehouse = await registerAndLogin("warehouse");

    const meResponse = await request("GET", "/api/auth/me", {
        token: sales.token
    });
    expect(meResponse.status === 200, "GET /api/auth/me failed");

    const missingTokenResponse = await request("GET", "/api/customers");
    expect(
        missingTokenResponse.status === 401,
        "Missing token should return 401"
    );

    const forbiddenProductCreate = await request("POST", "/api/products", {
        token: sales.token,
        body: {
            name: `Forbidden ${RUN_ID}`,
            sku: `FORBIDDEN-${RUN_ID}`,
            category: "Test",
            unit_price: 50,
            current_stock: 1,
            minimum_stock: 1,
            warehouse: "Main"
        }
    });
    expect(
        forbiddenProductCreate.status === 403,
        "Sales user should not create products"
    );

    const productAResponse = await request("POST", "/api/products", {
        token: admin.token,
        body: {
            name: `Smoke Product A ${RUN_ID}`,
            sku: `SMK-A-${RUN_ID}`,
            category: "Smoke",
            unit_price: 100,
            current_stock: 20,
            minimum_stock: 3,
            warehouse: "Main Warehouse"
        }
    });
    expect(productAResponse.status === 201, "Create product A failed");
    state.productAId = productAResponse.json.product.id;

    const productBResponse = await request("POST", "/api/products", {
        token: admin.token,
        body: {
            name: `Smoke Product B ${RUN_ID}`,
            sku: `SMK-B-${RUN_ID}`,
            category: "Smoke",
            unit_price: 75,
            current_stock: 5,
            minimum_stock: 2,
            warehouse: "Main Warehouse"
        }
    });
    expect(productBResponse.status === 201, "Create product B failed");
    state.productBId = productBResponse.json.product.id;

    const stockInResponse = await request(
        "POST",
        `/api/products/${state.productBId}/stock/in`,
        {
            token: warehouse.token,
            body: {
                quantity: 5,
                reason: "Smoke stock in"
            }
        }
    );
    expect(stockInResponse.status === 201, "Stock in failed");

    const stockOutInvalidResponse = await request(
        "POST",
        `/api/products/${state.productBId}/stock/out`,
        {
            token: warehouse.token,
            body: {
                quantity: 999,
                reason: "Too much"
            }
        }
    );
    expect(
        stockOutInvalidResponse.status === 400,
        "Insufficient stock should return 400"
    );

    const customerResponse = await request("POST", "/api/customers", {
        token: sales.token,
        body: {
            name: `Smoke Customer ${RUN_ID}`,
            mobile: `${RUN_ID}`.slice(-10),
            email: `customer_${RUN_ID}@example.com`,
            business_name: `Smoke Business ${RUN_ID}`,
            gst_number: `GST${RUN_ID}`,
            customer_type: "wholesale",
            address: "Smoke Address",
            status: "active",
            notes: "Created by smoke test"
        }
    });
    expect(customerResponse.status === 201, "Create customer failed");
    state.customerId = customerResponse.json.customer.id;

    const followupResponse = await request(
        "POST",
        `/api/customers/${state.customerId}/followups`,
        {
            token: sales.token,
            body: {
                note: "Smoke follow-up",
                follow_up_date: "2026-08-20"
            }
        }
    );
    expect(followupResponse.status === 201, "Create follow-up failed");

    const duplicateItemsResponse = await request("POST", "/api/challans", {
        token: sales.token,
        body: {
            customer_id: state.customerId,
            items: [
                { product_id: state.productAId, quantity: 1 },
                { product_id: state.productAId, quantity: 2 }
            ]
        }
    });
    expect(
        duplicateItemsResponse.status === 409,
        "Duplicate challan items should return 409"
    );

    const challanDraftResponse = await request("POST", "/api/challans", {
        token: sales.token,
        body: {
            customer_id: state.customerId,
            items: [
                { product_id: state.productAId, quantity: 4 },
                { product_id: state.productBId, quantity: 3 }
            ]
        }
    });
    expect(
        challanDraftResponse.status === 201,
        "Create valid challan draft failed"
    );
    state.challanId = challanDraftResponse.json.data.challan.id;

    const confirmResponse = await request(
        "POST",
        `/api/challans/${state.challanId}/confirm`,
        {
            token: sales.token
        }
    );
    expect(confirmResponse.status === 200, "Confirm challan failed");
    expect(
        confirmResponse.json.data.challan.status === "confirmed",
        "Confirmed challan should have confirmed status"
    );

    const confirmedProductA = await getProduct(sales.token, state.productAId);
    const confirmedProductB = await getProduct(sales.token, state.productBId);
    expect(
        Number(confirmedProductA.current_stock) === 16,
        "Product A stock should reduce after confirmation"
    );
    expect(
        Number(confirmedProductB.current_stock) === 7,
        "Product B stock should reduce after confirmation"
    );

    const confirmAgainResponse = await request(
        "POST",
        `/api/challans/${state.challanId}/confirm`,
        {
            token: sales.token
        }
    );
    expect(
        confirmAgainResponse.status === 409,
        "Reconfirming challan should return 409"
    );

    const draftForRollbackResponse = await request("POST", "/api/challans", {
        token: sales.token,
        body: {
            customer_id: state.customerId,
            items: [
                { product_id: state.productAId, quantity: 5 },
                { product_id: state.productBId, quantity: 10 }
            ]
        }
    });
    expect(
        draftForRollbackResponse.status === 201,
        "Create rollback challan draft failed"
    );
    state.rollbackChallanId = draftForRollbackResponse.json.data.challan.id;

    const beforeFailureA = await getProduct(sales.token, state.productAId);
    const beforeFailureB = await getProduct(sales.token, state.productBId);
    const beforeFailureMovementsA = await getMovements(
        warehouse.token,
        state.productAId
    );
    const beforeFailureMovementsB = await getMovements(
        warehouse.token,
        state.productBId
    );

    const rollbackConfirmResponse = await request(
        "POST",
        `/api/challans/${state.rollbackChallanId}/confirm`,
        {
            token: sales.token
        }
    );
    expect(
        rollbackConfirmResponse.status === 400,
        "Rollback stock failure should return 400"
    );

    const rollbackDetailResponse = await request(
        "GET",
        `/api/challans/${state.rollbackChallanId}`,
        {
            token: sales.token
        }
    );
    expect(
        rollbackDetailResponse.status === 200 &&
            rollbackDetailResponse.json.data.challan.status === "draft",
        "Rollback challan should remain draft"
    );

    const afterFailureA = await getProduct(sales.token, state.productAId);
    const afterFailureB = await getProduct(sales.token, state.productBId);
    const afterFailureMovementsA = await getMovements(
        warehouse.token,
        state.productAId
    );
    const afterFailureMovementsB = await getMovements(
        warehouse.token,
        state.productBId
    );

    expect(
        Number(afterFailureA.current_stock) === Number(beforeFailureA.current_stock),
        "Product A stock changed during rollback scenario"
    );
    expect(
        Number(afterFailureB.current_stock) === Number(beforeFailureB.current_stock),
        "Product B stock changed during rollback scenario"
    );
    expect(
        afterFailureMovementsA.length === beforeFailureMovementsA.length,
        "Product A movement count changed during rollback scenario"
    );
    expect(
        afterFailureMovementsB.length === beforeFailureMovementsB.length,
        "Product B movement count changed during rollback scenario"
    );

    const cancelConfirmedResponse = await request(
        "POST",
        `/api/challans/${state.challanId}/cancel`,
        {
            token: sales.token
        }
    );
    expect(
        cancelConfirmedResponse.status === 409,
        "Confirmed challan cancel should return 409"
    );

    const cancelDraftResponse = await request(
        "POST",
        `/api/challans/${state.rollbackChallanId}/cancel`,
        {
            token: sales.token
        }
    );
    expect(cancelDraftResponse.status === 200, "Cancel draft challan failed");

    const challanListResponse = await request(
        "GET",
        `/api/challans?search=CH-&status=confirmed&page=1&limit=5`,
        {
            token: sales.token
        }
    );
    expect(challanListResponse.status === 200, "List challans failed");

    const dashboardResponse = await request("GET", "/api/dashboard", {
        token: warehouse.token
    });
    expect(dashboardResponse.status === 200, "Dashboard metrics failed");

    const lowStockResponse = await request(
        "GET",
        "/api/dashboard/low-stock",
        {
            token: warehouse.token
        }
    );
    expect(lowStockResponse.status === 200, "Dashboard low-stock failed");

    console.log("Smoke test passed");
    console.log(
        JSON.stringify(
            {
                runId: RUN_ID,
                customerId: state.customerId,
                productAId: state.productAId,
                productBId: state.productBId,
                challanId: state.challanId,
                rollbackChallanId: state.rollbackChallanId
            },
            null,
            2
        )
    );
};

main().catch((error) => {
    console.error("Smoke test failed");
    console.error(error);
    process.exit(1);
});
