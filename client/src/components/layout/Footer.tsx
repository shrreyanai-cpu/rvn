import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-lg font-bold mb-4">
              <span className="text-foreground">RAVINDRRA</span>{" "}
              <span className="text-[#C9A961]">VASTRA</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium Indian clothing for every occasion. Traditional elegance meets modern craftsmanship.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {["Sarees", "Kurtas", "Lehengas", "Sherwanis", "Accessories"].map((item) => (
                <li key={item}>
                  <Link href={`/shop?category=${item.toLowerCase()}`}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {item}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2.5">
              {["Shipping & Delivery", "Returns & Exchanges", "Size Guide", "Contact Us"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>Ravindrra Vastra Niketan</li>
              <li>info@ravindrra.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ravindrra Vastra Niketan. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
