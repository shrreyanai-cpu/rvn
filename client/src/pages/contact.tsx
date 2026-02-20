import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, MessageCircle, Mail, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your message has been sent successfully. We'll get back to you soon!",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: ContactFormValues) {
    contactMutation.mutate(values);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#2C3E50] text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2" data-testid="text-contact-title">
            Get in Touch
          </h1>
          <p className="text-gray-300">We'd love to hear from you. Send us a message.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Left Side - Store Information */}
          <div className="space-y-6">
            {/* Store Header */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-1" data-testid="text-store-name">
                Ravindrra Vastra Niketan
              </h2>
              <p className="text-[#C9A961] font-medium" data-testid="text-store-tagline">
                Premium Indian Fashion Since 1985
              </p>
            </div>

            {/* Contact Information Cards */}
            <div className="space-y-4">
              {/* Address */}
              <Card className="p-4" data-testid="card-address">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Address</h3>
                    <p className="text-sm text-muted-foreground" data-testid="text-address">
                      MG Road, Raipur, Chhattisgarh 492001
                    </p>
                  </div>
                </div>
              </Card>

              {/* Phone */}
              <Card className="p-4" data-testid="card-phone">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Phone</h3>
                    <a
                      href="tel:+918889777992"
                      className="text-sm text-[#C9A961] hover:underline"
                      data-testid="link-phone"
                    >
                      +91 8889777992
                    </a>
                  </div>
                </div>
              </Card>

              {/* WhatsApp */}
              <Card className="p-4" data-testid="card-whatsapp">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/918889777992"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#C9A961] hover:underline"
                      data-testid="link-whatsapp"
                    >
                      8889777992
                    </a>
                  </div>
                </div>
              </Card>

              {/* Email */}
              <Card className="p-4" data-testid="card-email">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Email</h3>
                    <a
                      href="mailto:support@ravindrra.com"
                      className="text-sm text-[#C9A961] hover:underline"
                      data-testid="link-email"
                    >
                      support@ravindrra.com
                    </a>
                  </div>
                </div>
              </Card>

              {/* Business Hours */}
              <Card className="p-4" data-testid="card-hours">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#C9A961] mt-0.5 flex-shrink-0" />
                  <div className="w-full">
                    <h3 className="font-semibold text-sm mb-2">Business Hours</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between" data-testid="text-hours-weekday">
                        <span>Mon - Sat:</span>
                        <span>10:00 AM - 8:00 PM</span>
                      </div>
                      <div className="flex justify-between" data-testid="text-hours-sunday">
                        <span>Sunday:</span>
                        <span>11:00 AM - 6:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div>
            <Card className="p-6 sm:p-8">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C3E50] mb-6" data-testid="text-form-title">
                Send us a Message
              </h3>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            data-testid="input-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your@email.com"
                            type="email"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Field */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your phone number"
                            type="tel"
                            data-testid="input-phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subject Field */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="What is this about?"
                            data-testid="input-subject"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message Field */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about your inquiry..."
                            className="min-h-32"
                            data-testid="textarea-message"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[#2C3E50] hover:bg-[#1a2634] text-white"
                    disabled={contactMutation.isPending}
                    data-testid="button-submit"
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
        </div>

        {/* Google Maps Section */}
        <div className="mt-12 sm:mt-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-6" data-testid="text-map-title">
            Find Us on the Map
          </h2>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d238132.60192973388!2d81.5246!3d21.2514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28dda23be28229%3A0x163ee1204ff9e240!2sRaipur%2C+Chhattisgarh!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="450"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              data-testid="iframe-google-maps"
              className="border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
