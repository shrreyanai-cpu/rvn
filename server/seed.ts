import { storage } from "./storage";
import { db } from "./db";
import { categories, products } from "@shared/schema";

export async function seedDatabase() {
  const existingCategories = await storage.getCategories();
  if (existingCategories.length > 0) {
    return;
  }

  console.log("Seeding database with initial data...");

  const categoryData = [
    { name: "Sarees", slug: "sarees", description: "Exquisite handcrafted sarees in silk, chiffon, and cotton", imageUrl: "/images/products/silk-saree-burgundy.png" },
    { name: "Kurtas", slug: "kurtas", description: "Premium kurtas and kurta sets for men and women", imageUrl: "/images/products/navy-kurta-set.png" },
    { name: "Lehengas", slug: "lehengas", description: "Stunning lehenga cholis for weddings and celebrations", imageUrl: "/images/products/emerald-lehenga.png" },
    { name: "Sherwanis", slug: "sherwanis", description: "Regal sherwanis and achkans for grooms and special occasions", imageUrl: "/images/products/cream-sherwani.png" },
    { name: "Accessories", slug: "accessories", description: "Beautiful dupattas, stoles, and fashion accessories", imageUrl: "/images/products/pink-banarasi-dupatta.png" },
  ];

  const createdCategories: Record<string, number> = {};
  for (const cat of categoryData) {
    const created = await storage.createCategory(cat);
    createdCategories[cat.slug] = created.id;
  }

  const productData = [
    {
      name: "Royal Burgundy Silk Saree",
      slug: "royal-burgundy-silk-saree",
      description: "A magnificent pure silk saree in deep burgundy with intricate gold zari border work. Handwoven by master artisans from Varanasi, this saree exemplifies the finest traditions of Indian textile craftsmanship. Perfect for weddings and festive occasions.",
      price: "12999.00",
      compareAtPrice: "15999.00",
      categoryId: createdCategories["sarees"],
      images: ["/images/products/silk-saree-burgundy.png"],
      sizes: ["Free Size"],
      colors: ["Burgundy", "Gold"],
      material: "Pure Banarasi Silk",
      inStock: true,
      stockQuantity: 15,
      featured: true,
    },
    {
      name: "Navy Blue Kurta Pajama Set",
      slug: "navy-blue-kurta-pajama-set",
      description: "A sophisticated navy blue kurta pajama set crafted from premium cotton silk blend. Features subtle embroidery on the collar and sleeves. Ideal for festive gatherings and formal occasions.",
      price: "4999.00",
      compareAtPrice: null,
      categoryId: createdCategories["kurtas"],
      images: ["/images/products/navy-kurta-set.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Navy Blue"],
      material: "Cotton Silk Blend",
      inStock: true,
      stockQuantity: 30,
      featured: true,
    },
    {
      name: "Emerald Green Lehenga Choli",
      slug: "emerald-green-lehenga-choli",
      description: "A breathtaking emerald green lehenga choli adorned with exquisite gold zari embroidery. The flared lehenga features a heavily embroidered border, paired with a beautifully designed choli and net dupatta. A showstopper for weddings.",
      price: "24999.00",
      compareAtPrice: "29999.00",
      categoryId: createdCategories["lehengas"],
      images: ["/images/products/emerald-lehenga.png"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Emerald Green", "Gold"],
      material: "Silk with Zari Work",
      inStock: true,
      stockQuantity: 8,
      featured: true,
    },
    {
      name: "Cream Gold Designer Sherwani",
      slug: "cream-gold-designer-sherwani",
      description: "An exquisite cream sherwani with elaborate gold embroidery, perfect for grooms. Features intricate thread work and sequin detailing on premium jacquard fabric. Comes with matching churidar and stole.",
      price: "18999.00",
      compareAtPrice: "22999.00",
      categoryId: createdCategories["sherwanis"],
      images: ["/images/products/cream-sherwani.png"],
      sizes: ["38", "40", "42", "44"],
      colors: ["Cream", "Ivory"],
      material: "Jacquard Silk",
      inStock: true,
      stockQuantity: 12,
      featured: true,
    },
    {
      name: "Royal Blue Anarkali Suit",
      slug: "royal-blue-anarkali-suit",
      description: "A stunning royal blue Anarkali suit with silver embroidery. The flowing silhouette is complemented by intricate threadwork on the bodice and hem. Includes matching churidar and dupatta.",
      price: "8999.00",
      compareAtPrice: null,
      categoryId: createdCategories["kurtas"],
      images: ["/images/products/blue-anarkali.png"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Royal Blue", "Silver"],
      material: "Georgette",
      inStock: true,
      stockQuantity: 20,
      featured: false,
    },
    {
      name: "Classic White Cotton Kurta",
      slug: "classic-white-cotton-kurta",
      description: "A timeless white kurta crafted from the finest organic cotton. Features clean lines and minimalist design, perfect for everyday wear and casual gatherings. Breathable and comfortable for all seasons.",
      price: "2499.00",
      compareAtPrice: null,
      categoryId: createdCategories["kurtas"],
      images: ["/images/products/white-cotton-kurta.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["White", "Off-White"],
      material: "Organic Cotton",
      inStock: true,
      stockQuantity: 50,
      featured: false,
    },
    {
      name: "Pink Banarasi Silk Dupatta",
      slug: "pink-banarasi-silk-dupatta",
      description: "A luxurious pink Banarasi silk dupatta with intricate gold zari weaving. This versatile accessory adds elegance to any outfit, whether paired with a simple kurta or a festive ensemble.",
      price: "3499.00",
      compareAtPrice: "4499.00",
      categoryId: createdCategories["accessories"],
      images: ["/images/products/pink-banarasi-dupatta.png"],
      sizes: ["Free Size"],
      colors: ["Pink", "Gold"],
      material: "Banarasi Silk",
      inStock: true,
      stockQuantity: 25,
      featured: false,
    },
    {
      name: "Maroon Velvet Nehru Jacket",
      slug: "maroon-velvet-nehru-jacket",
      description: "A distinguished maroon velvet Nehru jacket that adds instant sophistication to any outfit. Features gold buttons, satin lining, and impeccable tailoring. Perfect layered over kurtas or formal shirts.",
      price: "5999.00",
      compareAtPrice: null,
      categoryId: createdCategories["sherwanis"],
      images: ["/images/products/maroon-nehru-jacket.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Maroon"],
      material: "Velvet",
      inStock: true,
      stockQuantity: 18,
      featured: true,
    },
    {
      name: "Lavender Chiffon Saree",
      slug: "lavender-chiffon-saree",
      description: "A graceful lavender chiffon saree with delicate silver border embroidery. Lightweight and elegant, this saree drapes beautifully and is perfect for evening occasions and cocktail events.",
      price: "6999.00",
      compareAtPrice: "8499.00",
      categoryId: createdCategories["sarees"],
      images: ["/images/products/lavender-chiffon-saree.png"],
      sizes: ["Free Size"],
      colors: ["Lavender", "Silver"],
      material: "Pure Chiffon",
      inStock: true,
      stockQuantity: 22,
      featured: false,
    },
    {
      name: "Red Bridal Lehenga",
      slug: "red-bridal-lehenga",
      description: "A magnificent red bridal lehenga featuring heavy kundan and zardozi embroidery. This bridal masterpiece is crafted with the finest silk and adorned with thousands of hand-applied sequins. The ultimate statement for the modern Indian bride.",
      price: "45999.00",
      compareAtPrice: "55999.00",
      categoryId: createdCategories["lehengas"],
      images: ["/images/products/red-bridal-lehenga.png"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Red", "Gold"],
      material: "Heavy Silk with Kundan Work",
      inStock: true,
      stockQuantity: 5,
      featured: true,
    },
    {
      name: "Black Achkan Coat",
      slug: "black-achkan-coat",
      description: "A strikingly elegant black achkan coat with gold buttons and subtle self-work embroidery. This structured silhouette is perfect for formal Indian occasions, sangeet, and reception events.",
      price: "14999.00",
      compareAtPrice: null,
      categoryId: createdCategories["sherwanis"],
      images: ["/images/products/black-achkan.png"],
      sizes: ["38", "40", "42", "44", "46"],
      colors: ["Black"],
      material: "Premium Wool Blend",
      inStock: true,
      stockQuantity: 10,
      featured: false,
    },
  ];

  for (const prod of productData) {
    await storage.createProduct(prod);
  }

  console.log("Database seeded successfully!");
}
