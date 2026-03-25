import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedAdminUser() {
  const adminEmail = "shrreyango@gmail.com";
  const [existing] = await db.select().from(users).where(eq(users.email, adminEmail));
  if (!existing) {
    const hashedPassword = await bcrypt.hash("100808", 12);
    await db.insert(users).values({
      email: adminEmail,
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      role: "super_admin",
      emailVerified: true,
    });
    console.log("Admin user created: " + adminEmail);
  } else if (!existing.isAdmin) {
    await db.update(users).set({ isAdmin: true, role: "super_admin" }).where(eq(users.id, existing.id));
    console.log("Admin privileges granted to: " + adminEmail);
}

async function seedTestUser() {
  const testEmail = "test@test.com";
  const [existing] = await db.select().from(users).where(eq(users.email, testEmail));
  if (!existing) {
    const hashedPassword = await bcrypt.hash("test@123", 12);
    await db.insert(users).values({
      email: testEmail,
      password: hashedPassword,
      firstName: "Test",
      lastName: "User",
      isAdmin: false,
      role: "user",
      emailVerified: true,
    });
    console.log("Test user created: " + testEmail);
  }
}


export async function seedDatabase() {
  await seedAdminUser();
  await seedTestUser();


  const existingCategories = await storage.getCategories();
  if (existingCategories.length > 0) {
    return;
  }

  console.log("Seeding database with initial data...");

  const mainCategories = [
    { name: "Sarees", slug: "sarees", description: "Exquisite handcrafted sarees in silk, chiffon, and cotton" },
    { name: "Men's Wear", slug: "mens-wear", description: "Premium clothing for men including kurtas, sherwanis, and more" },
    { name: "Women's Wear", slug: "womens-wear", description: "Elegant women's clothing from casual wear to party outfits" },
    { name: "Kids Wear", slug: "kids-wear", description: "Adorable and comfortable clothing for children" },
  ];

  const createdMain: Record<string, number> = {};
  for (const cat of mainCategories) {
    const created = await storage.createCategory(cat);
    createdMain[cat.slug] = created.id;
  }

  const subCategories: { parentSlug: string; name: string; slug: string; description: string }[] = [
    { parentSlug: "sarees", name: "Silk Sarees", slug: "silk-sarees", description: "Pure silk sarees from Banarasi, Kanjivaram, and more" },
    { parentSlug: "sarees", name: "Cotton Sarees", slug: "cotton-sarees", description: "Comfortable and elegant cotton sarees for daily and festive wear" },
    { parentSlug: "sarees", name: "Chiffon Sarees", slug: "chiffon-sarees", description: "Lightweight and graceful chiffon sarees" },
    { parentSlug: "sarees", name: "Designer Sarees", slug: "designer-sarees", description: "Premium designer sarees for special occasions" },
    { parentSlug: "sarees", name: "Printed Sarees", slug: "printed-sarees", description: "Beautiful printed sarees in various patterns" },
    { parentSlug: "sarees", name: "Georgette Sarees", slug: "georgette-sarees", description: "Flowy georgette sarees for a sophisticated look" },
    { parentSlug: "mens-wear", name: "Kurta", slug: "mens-kurta", description: "Traditional and modern kurtas for men" },
    { parentSlug: "mens-wear", name: "Sherwani", slug: "sherwani", description: "Regal sherwanis for grooms and special occasions" },
    { parentSlug: "mens-wear", name: "Nehru Jacket", slug: "nehru-jacket", description: "Classic Nehru jackets for a distinguished look" },
    { parentSlug: "mens-wear", name: "Shirt", slug: "mens-shirt", description: "Formal and casual shirts for men" },
    { parentSlug: "mens-wear", name: "Trouser", slug: "mens-trouser", description: "Well-fitted trousers for all occasions" },
    { parentSlug: "mens-wear", name: "Jeans", slug: "mens-jeans", description: "Stylish and comfortable jeans for men" },
    { parentSlug: "mens-wear", name: "T-Shirt", slug: "mens-tshirt", description: "Casual t-shirts for everyday comfort" },
    { parentSlug: "mens-wear", name: "Pajama Set", slug: "mens-pajama-set", description: "Comfortable kurta pajama sets for men" },
    { parentSlug: "mens-wear", name: "Dhoti", slug: "dhoti", description: "Traditional dhotis in silk and cotton" },
    { parentSlug: "womens-wear", name: "Regular Wear Dresses", slug: "regular-wear-dresses", description: "Comfortable and stylish dresses for daily wear" },
    { parentSlug: "womens-wear", name: "Cord Set", slug: "cord-set", description: "Trendy matching cord sets for a coordinated look" },
    { parentSlug: "womens-wear", name: "Kurti", slug: "kurti", description: "Beautiful kurtis in various styles and patterns" },
    { parentSlug: "womens-wear", name: "Dress Material", slug: "dress-material", description: "Unstitched dress materials with dupatta" },
    { parentSlug: "womens-wear", name: "Tops", slug: "womens-tops", description: "Trendy tops for casual and semi-formal wear" },
    { parentSlug: "womens-wear", name: "Jeans", slug: "womens-jeans", description: "Comfortable and stylish jeans for women" },
    { parentSlug: "womens-wear", name: "Night Pant", slug: "night-pant", description: "Soft and comfortable night pants for relaxation" },
    { parentSlug: "womens-wear", name: "Gown", slug: "gown", description: "Elegant gowns for parties and special occasions" },
    { parentSlug: "womens-wear", name: "Night Dress", slug: "night-dress", description: "Comfortable and stylish night dresses" },
    { parentSlug: "womens-wear", name: "Lehenga", slug: "lehenga", description: "Stunning lehenga cholis for weddings and celebrations" },
    { parentSlug: "womens-wear", name: "Anarkali", slug: "anarkali", description: "Graceful Anarkali suits in various designs" },
    { parentSlug: "womens-wear", name: "Dupatta", slug: "dupatta", description: "Beautiful dupattas and stoles as accessories" },
    { parentSlug: "kids-wear", name: "Boys Kurta", slug: "boys-kurta", description: "Traditional kurtas for boys" },
    { parentSlug: "kids-wear", name: "Girls Lehenga", slug: "girls-lehenga", description: "Mini lehengas and chaniya cholis for girls" },
    { parentSlug: "kids-wear", name: "Boys Shirt", slug: "boys-shirt", description: "Casual and formal shirts for boys" },
    { parentSlug: "kids-wear", name: "Girls Dress", slug: "girls-dress", description: "Adorable frocks and dresses for girls" },
    { parentSlug: "kids-wear", name: "Boys T-Shirt", slug: "boys-tshirt", description: "Fun and comfortable t-shirts for boys" },
    { parentSlug: "kids-wear", name: "Girls Kurti", slug: "girls-kurti", description: "Pretty kurtis for girls" },
    { parentSlug: "kids-wear", name: "Boys Jeans", slug: "boys-jeans", description: "Durable and stylish jeans for boys" },
    { parentSlug: "kids-wear", name: "Girls Jeans", slug: "girls-jeans", description: "Trendy jeans for girls" },
    { parentSlug: "kids-wear", name: "Kids Night Wear", slug: "kids-night-wear", description: "Soft and cozy night wear for children" },
    { parentSlug: "kids-wear", name: "Kids Ethnic Set", slug: "kids-ethnic-set", description: "Traditional ethnic sets for kids" },
  ];

  const createdSub: Record<string, number> = {};
  for (const sub of subCategories) {
    const created = await storage.createCategory({
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      parentId: createdMain[sub.parentSlug],
    });
    createdSub[sub.slug] = created.id;
  }

  const productData = [
    {
      name: "Royal Burgundy Silk Saree",
      slug: "royal-burgundy-silk-saree",
      description: "A magnificent pure silk saree in deep burgundy with intricate gold zari border work. Handwoven by master artisans from Varanasi, this saree exemplifies the finest traditions of Indian textile craftsmanship. Perfect for weddings and festive occasions.",
      price: "12999.00",
      compareAtPrice: "15999.00",
      categoryId: createdSub["silk-sarees"],
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
      categoryId: createdSub["mens-kurta"],
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
      categoryId: createdSub["lehenga"],
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
      categoryId: createdSub["sherwani"],
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
      categoryId: createdSub["anarkali"],
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
      categoryId: createdSub["mens-kurta"],
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
      categoryId: createdSub["dupatta"],
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
      categoryId: createdSub["nehru-jacket"],
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
      categoryId: createdSub["chiffon-sarees"],
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
      categoryId: createdSub["lehenga"],
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
      categoryId: createdSub["sherwani"],
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
