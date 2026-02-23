import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, Search, ShoppingBag, Truck, RotateCcw, CreditCard, Shield, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import SEOHead from "@/components/seo";

const faqCategories = [
  {
    id: "shopping-orders",
    title: "Shopping & Orders",
    icon: ShoppingBag,
    questions: [
      {
        q: "How do I place an order?",
        a: "Browse our collection, select your desired product, choose the size and quantity, and click \"Add to Cart\". Once you're ready, proceed to checkout, fill in your shipping details, and complete payment. You'll receive an order confirmation via email and WhatsApp.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "Orders can be modified or cancelled within 1 hour of placing them. After that, the order enters processing and cannot be changed. Please contact us immediately on WhatsApp at 8889777992 if you need to make changes.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order is shipped, you'll receive a tracking link via email and WhatsApp. You can also track your order by visiting the \"Track Order\" page on our website or by checking the \"My Orders\" section in your account.",
      },
      {
        q: "How can I contact customer support?",
        a: "You can reach us via WhatsApp at 8889777992 for the fastest response. You can also email us at support@ravindrra.com or use the Contact Us page on our website. Our team typically responds within a few hours during business hours.",
      },
    ],
  },
  {
    id: "shipping-delivery",
    title: "Shipping & Delivery",
    icon: Truck,
    questions: [
      {
        q: "What are the shipping charges?",
        a: "We offer free shipping on all orders above Rs. 1,000. For orders below Rs. 1,000, a flat shipping fee of Rs. 80 is applied. Shipping charges are calculated at checkout.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 5-7 business days across India. We ship all orders through our trusted logistics partner Delhivery, ensuring safe and timely delivery of your garments.",
      },
      {
        q: "Do you deliver across India?",
        a: "Yes, we deliver to all serviceable pin codes across India through Delhivery. During checkout, you can verify if delivery is available to your pin code.",
      },
      {
        q: "Will I receive a tracking number?",
        a: "Yes, once your order is dispatched, you will receive a tracking number via email and WhatsApp. You can use this to track your shipment in real-time on the Delhivery website or our Track Order page.",
      },
    ],
  },
  {
    id: "returns-refunds",
    title: "Returns & Refunds",
    icon: RotateCcw,
    questions: [
      {
        q: "What is your return policy?",
        a: "We accept returns only for damaged or defective items. You must report the damage within 2 days of delivery. An unboxing video is mandatory for all return requests \u2014 without it, returns will not be processed. Please record a continuous video while opening your parcel.",
      },
      {
        q: "Can I exchange for a different colour or size?",
        a: "No, we do not offer colour or size exchanges. Please check the product images, description, and size guide carefully before placing your order. Slight colour variations may occur due to screen settings and photography lighting.",
      },
      {
        q: "How do I request a return for a damaged item?",
        a: "Go to \"My Orders\" in your account, find the delivered order, and click \"Return\". Upload your unboxing video showing the sealed package being opened and the damage. Describe the damage clearly and submit. Our team will review and respond within 24-48 hours.",
      },
      {
        q: "How long does the refund take?",
        a: "Once your return is approved after video verification, ship the item back within 3 days. After we receive and inspect the returned item, your refund will be processed within 1-3 business days to the original payment method. Shipping charges are non-refundable.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept payments through Cashfree payment gateway, which supports UPI (Google Pay, PhonePe, Paytm, etc.), credit/debit cards (Visa, Mastercard, RuPay), and net banking from all major banks. All transactions are secured with industry-standard encryption.",
      },
      {
        q: "Is Cash on Delivery (COD) available?",
        a: "No, we currently do not offer Cash on Delivery. All orders must be prepaid through our secure online payment gateway. This helps us keep prices competitive and ensures a smoother order processing experience.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. All payments are processed through Cashfree, a PCI DSS compliant payment gateway. We never store your card details on our servers. Your financial information is encrypted and transmitted securely.",
      },
      {
        q: "What if my payment fails but money is deducted?",
        a: "In rare cases of payment failure where money is deducted, the amount will be automatically refunded to your account within 5-7 business days by your bank. If you don't receive the refund, please contact us on WhatsApp at 8889777992 with your order details.",
      },
    ],
  },
  {
    id: "account-security",
    title: "Account & Security",
    icon: Shield,
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the \"Login\" button on the top of the page and sign in using your Replit account. Your account will be created automatically on first login, and you can start shopping right away.",
      },
      {
        q: "How do I manage my account details?",
        a: "After logging in, go to your Profile page where you can update your personal information, manage saved addresses, and view your order history. You can also manage your wishlist and saved items.",
      },
      {
        q: "Is my personal information safe?",
        a: "Yes, we take data privacy very seriously. Your personal information is stored securely and is never shared with third parties without your consent. Please refer to our Privacy Policy for complete details on how we handle your data.",
      },
    ],
  },
  {
    id: "products-sizing",
    title: "Products & Sizing",
    icon: Ruler,
    questions: [
      {
        q: "Are all products authentic?",
        a: "Yes, we guarantee 100% authenticity of all products sold on Ravindrra Vastra Niketan. Every garment is sourced directly from trusted manufacturers and artisans. We take pride in offering genuine, high-quality Indian ethnic wear.",
      },
      {
        q: "Is a size guide available?",
        a: "Yes, each product page includes a detailed size guide with measurements in inches and centimetres. We recommend measuring yourself and comparing with our size chart before ordering, as sizes may vary between different styles and brands.",
      },
      {
        q: "Why do product colours look different from what I received?",
        a: "Slight colour variations between the product image and the actual item can occur due to differences in screen display settings, resolution, and photography lighting. We make every effort to represent colours as accurately as possible. Colour differences are not eligible for returns or exchanges.",
      },
      {
        q: "Do you offer customisation or tailoring?",
        a: "Currently, we offer ready-to-wear garments in standard sizes. Customisation and tailoring services are not available at this time. Please check the size guide on each product page to find your best fit.",
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return faqCategories;
    const query = searchQuery.toLowerCase();
    return faqCategories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (faq) =>
            faq.q.toLowerCase().includes(query) ||
            faq.a.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchQuery]);

  const totalResults = filteredCategories.reduce(
    (sum, cat) => sum + cat.questions.length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Frequently Asked Questions"
        description="Find answers to common questions about shopping, shipping, returns, payments, and more at Ravindrra Vastra Niketan."
        keywords="FAQ, frequently asked questions, shipping, returns, payments, Indian fashion help"
        ogType="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqCategories.flatMap((cat) =>
            cat.questions.map((faq) => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a,
              },
            }))
          ),
        }}
      />
      <div className="bg-[#2C3E50] text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-white hover:bg-white/10"
              data-testid="button-back-home"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1
            className="font-serif text-3xl sm:text-4xl font-bold mb-2"
            data-testid="text-faq-title"
          >
            Frequently Asked Questions
          </h1>
          <p className="text-gray-300" data-testid="text-faq-subtitle">
            Find answers to common questions about shopping, shipping, returns,
            and more.
          </p>

          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white text-foreground"
              data-testid="input-faq-search"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {searchQuery.trim() && (
          <p
            className="text-sm text-muted-foreground mb-6"
            data-testid="text-search-results"
          >
            {totalResults === 0
              ? "No results found. Try a different search term."
              : `Showing ${totalResults} result${totalResults !== 1 ? "s" : ""} for "${searchQuery}"`}
          </p>
        )}

        {filteredCategories.length === 0 && (
          <div className="text-center py-16" data-testid="container-no-results">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="font-serif text-xl font-semibold text-[#2C3E50] mb-2">
              No matching questions found
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Try searching with different keywords or browse all categories.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchQuery("")}
              data-testid="button-clear-search"
            >
              Clear Search
            </Button>
          </div>
        )}

        <div className="space-y-10">
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <section key={category.id} data-testid={`section-${category.id}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-[#C9A961]/10">
                    <IconComponent className="h-5 w-5 text-[#C9A961]" />
                  </div>
                  <h2
                    className="font-serif text-xl sm:text-2xl font-bold text-[#2C3E50]"
                    data-testid={`text-category-${category.id}`}
                  >
                    {category.title}
                  </h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.id}-${index}`}
                      data-testid={`accordion-item-${category.id}-${index}`}
                    >
                      <AccordionTrigger
                        className="text-left text-[#2C3E50] hover:text-[#C9A961] hover:no-underline"
                        data-testid={`accordion-trigger-${category.id}-${index}`}
                      >
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent
                        className="text-muted-foreground leading-relaxed"
                        data-testid={`accordion-content-${category.id}-${index}`}
                      >
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>

        {filteredCategories.length > 0 && (
          <div
            className="mt-16 text-center border-t pt-10"
            data-testid="container-still-need-help"
          >
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C3E50] mb-2">
              Still have questions?
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Our support team is happy to help you with any queries.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/918889777992"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-whatsapp-support"
              >
                <Button className="bg-[#2C3E50] text-white">
                  WhatsApp: 8889777992
                </Button>
              </a>
              <Link href="/contact">
                <Button variant="outline" data-testid="link-contact-page">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
