import { DatabaseStorage } from "../server/storage";
import { InsertProduct } from "../shared/schema";

async function verifySkuGeneration() {
  const storage = new DatabaseStorage();
  
  console.log("Verifying SKU auto-generation...");

  const baseProduct: InsertProduct = {
    name: "Test Product",
    slug: "test-product-" + Date.now(),
    description: "A test product for SKU verification",
    price: "99.99",
    categoryId: 1, // Assuming category 1 exists
    images: [],
    sizes: [],
    colors: [],
    material: "Test Material",
    brand: "Test Brand",
    inStock: true,
    stockQuantity: 10,
    featured: false,
    weight: 100,
  };

  try {
    const p1 = await storage.createProduct({ ...baseProduct, name: "Test 1", slug: "test-1-" + Date.now() });
    console.log(`Created Product 1 with SKU: ${p1.sku}`);
    
    const p2 = await storage.createProduct({ ...baseProduct, name: "Test 2", slug: "test-2-" + Date.now() });
    console.log(`Created Product 2 with SKU: ${p2.sku}`);

    if (p1.sku?.startsWith("RVN") && p2.sku?.startsWith("RVN")) {
      const n1 = parseInt(p1.sku.replace("RVN", ""), 10);
      const n2 = parseInt(p2.sku.replace("RVN", ""), 10);
      if (n2 === n1 + 1) {
        console.log("SUCCESS: SKUs are incremental.");
      } else {
        console.log(`FAILURE: SKUs are not correctly incremental (${p1.sku} -> ${p2.sku})`);
      }
    } else {
      console.log("FAILURE: SKUs do not start with 'RVN'");
    }
  } catch (error) {
    console.error("Error during SKU verification:", error);
  }
}

verifySkuGeneration().then(() => process.exit(0));
