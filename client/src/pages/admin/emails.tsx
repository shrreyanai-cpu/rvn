import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Send, Users, Loader2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AdminEmails() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [recipients, setRecipients] = useState<"all" | "selected">("all");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/customers"],
  });

  const sendMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/email/send", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Emails sent!", description: `Successfully sent to ${data.sent} recipient(s).` });
      setSubject("");
      setHeading("");
      setBody("");
      setCtaText("");
      setCtaUrl("");
      setSelectedEmails([]);
    },
    onError: () => {
      toast({ title: "Failed to send emails", variant: "destructive" });
    },
  });

  const filteredCustomers = customers.filter((c: any) => {
    if (!c.email) return false;
    const name = `${c.firstName || ""} ${c.lastName || ""}`.trim().toLowerCase();
    const email = (c.email || "").toLowerCase();
    const q = customerSearch.toLowerCase();
    return q === "" || name.includes(q) || email.includes(q);
  });

  const toggleEmail = (email: string) => {
    setSelectedEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const selectAll = () => {
    const allEmails = filteredCustomers.map((c: any) => c.email).filter(Boolean);
    setSelectedEmails(allEmails);
  };

  const deselectAll = () => setSelectedEmails([]);

  const handleSend = () => {
    if (!subject.trim() || !heading.trim() || !body.trim()) {
      toast({ title: "Please fill in subject, heading, and body", variant: "destructive" });
      return;
    }
    if (recipients === "selected" && selectedEmails.length === 0) {
      toast({ title: "Please select at least one recipient", variant: "destructive" });
      return;
    }
    sendMutation.mutate({
      subject,
      heading,
      body: body.replace(/\n/g, "<br/>"),
      ctaText: ctaText || undefined,
      ctaUrl: ctaUrl || undefined,
      recipients,
      selectedEmails: recipients === "selected" ? selectedEmails : undefined,
    });
  };

  const recipientCount = recipients === "all"
    ? customers.filter((c: any) => c.email).length
    : selectedEmails.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold" data-testid="text-admin-emails-title">Email Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">Send promotional emails and announcements to your customers</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            disabled={!heading && !body}
            data-testid="button-preview-email"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSend}
            disabled={sendMutation.isPending || !subject.trim() || !heading.trim() || !body.trim()}
            data-testid="button-send-email"
          >
            {sendMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send to {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg">
                <Mail className="h-5 w-5 flex-shrink-0" />
                Compose Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Exclusive Festive Sale - Up to 50% Off!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  data-testid="input-email-subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heading">Email Heading</Label>
                <Input
                  id="heading"
                  placeholder="e.g., Celebrate This Season in Style"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  data-testid="input-email-heading"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  placeholder="Write your email content here. Use line breaks for paragraphs."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  data-testid="input-email-body"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">Button Text (optional)</Label>
                  <Input
                    id="ctaText"
                    placeholder="e.g., Shop Now"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    data-testid="input-email-cta-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaUrl">Button Link (optional)</Label>
                  <Input
                    id="ctaUrl"
                    placeholder="e.g., https://yoursite.com/sale"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    data-testid="input-email-cta-url"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg">
                <Users className="h-5 w-5 flex-shrink-0" />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={recipients} onValueChange={(v: "all" | "selected") => setRecipients(v)}>
                <SelectTrigger data-testid="select-recipients">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers ({customers.filter((c: any) => c.email).length})</SelectItem>
                  <SelectItem value="selected">Select Specific Customers</SelectItem>
                </SelectContent>
              </Select>

              {recipients === "selected" && (
                <div className="space-y-3">
                  <Input
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    data-testid="input-search-recipients"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={selectAll} data-testid="button-select-all">
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAll} data-testid="button-deselect-all">
                      Deselect All
                    </Button>
                    <Badge variant="secondary">{selectedEmails.length} selected</Badge>
                  </div>
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Customer</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.map((c: any) => (
                          <TableRow key={c.id} className="cursor-pointer" onClick={() => toggleEmail(c.email)}>
                            <TableCell>
                              <Checkbox
                                checked={selectedEmails.includes(c.email)}
                                onCheckedChange={() => toggleEmail(c.email)}
                                data-testid={`checkbox-recipient-${c.id}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{c.firstName} {c.lastName}</p>
                                <p className="text-xs text-muted-foreground">{c.email}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredCustomers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                              No customers found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3 text-sm text-center sm:text-left">Quick Templates</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setSubject("New Arrivals Just Dropped!");
                    setHeading("Fresh Styles Are Here");
                    setBody("We've just added stunning new pieces to our collection. From elegant sarees to dapper sherwanis, find the perfect outfit for every occasion.\n\nDon't miss out - shop our latest arrivals before they're gone!");
                    setCtaText("Shop New Arrivals");
                    setCtaUrl("");
                  }}
                  data-testid="button-template-new-arrivals"
                >
                  New Arrivals
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setSubject("Festive Season Sale - Up to 40% Off!");
                    setHeading("Celebrate in Style");
                    setBody("This festive season, dress in the finest Indian wear at unbeatable prices. Enjoy up to 40% off on select sarees, lehengas, sherwanis, and more.\n\nLimited time offer - shop now and make this celebration extra special!");
                    setCtaText("Shop the Sale");
                    setCtaUrl("");
                  }}
                  data-testid="button-template-sale"
                >
                  Festive Sale
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setSubject("Thank You for Being Part of Our Family");
                    setHeading("A Special Thank You");
                    setBody("We truly appreciate your trust in Ravindrra Vastra Niketan. As a valued customer, we wanted to take a moment to thank you for choosing us.\n\nStay tuned for exclusive offers and new collections coming your way soon!");
                    setCtaText("");
                    setCtaUrl("");
                  }}
                  data-testid="button-template-thank-you"
                >
                  Thank You Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>This is how your email will look to recipients.</DialogDescription>
          </DialogHeader>
          <div className="border rounded-md overflow-hidden">
            <div style={{ background: "#2C3E50", padding: "20px 24px", textAlign: "center" }}>
              <h1 style={{ margin: 0, color: "#C9A961", fontSize: "20px", fontFamily: "Georgia, serif", letterSpacing: "1px" }}>
                Ravindrra Vastra Niketan
              </h1>
            </div>
            <div className="p-6">
              <div className="text-center mb-5">
                <h2 className="text-xl font-serif font-bold" style={{ color: "#2C3E50" }}>
                  {heading || "Your Heading Here"}
                </h2>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#374151" }}>
                {body || "Your email body will appear here..."}
              </div>
              {ctaText && (
                <div className="text-center mt-6">
                  <span
                    className="inline-block px-8 py-3 rounded-md font-semibold text-sm"
                    style={{ background: "#2C3E50", color: "#C9A961" }}
                  >
                    {ctaText}
                  </span>
                </div>
              )}
            </div>
            <div style={{ background: "#F5EFE0", padding: "16px 24px", textAlign: "center", borderTop: "1px solid #e5e5e5" }}>
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} Ravindrra Vastra Niketan. All rights reserved.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
