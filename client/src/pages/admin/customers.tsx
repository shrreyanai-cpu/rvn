import { useState } from "react";
import { Link } from "wouter";
import { Search, ShoppingBag, Shield, Plus, Loader2, Eye, EyeOff, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ROLE_LABELS, type Role } from "@shared/models/auth";

type Customer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  role: string | null;
  createdAt: string;
  orderCount: number;
};

function CreateCustomerForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/customers", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Customer account created successfully" });
      onClose();
    },
    onError: (err: any) => {
      let description = "Failed to create customer account.";
      try {
        const parsed = JSON.parse(err?.message?.split(": ").slice(1).join(": ") || "{}");
        description = parsed.message || description;
      } catch {
        if (err?.message?.includes("409")) description = "An account with this email already exists.";
      }
      toast({ title: "Error", description, variant: "destructive" });
    },
  });

  const canSubmit = form.firstName && form.lastName && form.email && form.password.length >= 6;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>First Name</Label>
          <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" data-testid="input-customer-first-name" />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" data-testid="input-customer-last-name" />
        </div>
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="customer@example.com" data-testid="input-customer-email" />
      </div>
      <div>
        <Label>Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Min 6 characters"
            className="pr-10"
            data-testid="input-customer-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">The customer will use this password to sign in</p>
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !canSubmit}
          className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]"
          data-testid="button-save-customer"
        >
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create Customer
        </Button>
      </div>
    </div>
  );
}

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: customers, isLoading } = useQuery<Customer[]>({ queryKey: ["/api/admin/customers"] });

  const filtered = customers?.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.email?.toLowerCase().includes(s) ||
      c.firstName?.toLowerCase().includes(s) ||
      c.lastName?.toLowerCase().includes(s)
    );
  }) || [];

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold" data-testid="text-admin-customers-title">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">{customers?.length || 0} registered customers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2C3E50] dark:bg-[#C9A961] dark:text-[#1A1A1A]" data-testid="button-add-customer">
              <Plus className="mr-1.5 h-4 w-4" /> Create Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">Create Customer Account</DialogTitle>
            </DialogHeader>
            <CreateCustomerForm onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" data-testid="input-search-customers" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center"><p className="text-muted-foreground">No customers found</p></Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((customer) => {
                const initials = `${(customer.firstName || "")[0] || ""}${(customer.lastName || "")[0] || ""}`.toUpperCase() || "U";
                return (
                  <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                    <TableCell>
                      <Link href={`/admin/customers/${customer.id}`} className="flex items-center gap-3 hover:opacity-80" data-testid={`link-customer-detail-${customer.id}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-[#C9A961]/15 text-[#C9A961]">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-[#C9A961]">{customer.firstName || ""} {customer.lastName || ""}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{customer.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">{customer.email}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{customer.orderCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const role = (customer.role || (customer.isAdmin ? "super_admin" : "customer")) as Role;
                        const isStaff = role !== "customer";
                        return isStaff ? (
                          <Badge className="text-[10px] bg-[#C9A961]/15 text-[#C9A961] border-0 no-default-hover-elevate no-default-active-elevate">
                            <Shield className="h-3 w-3 mr-1" /> {ROLE_LABELS[role]}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] no-default-hover-elevate no-default-active-elevate border-0">
                            Customer
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/customers/${customer.id}`}>
                        <Button size="icon" variant="ghost" data-testid={`button-view-customer-${customer.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
