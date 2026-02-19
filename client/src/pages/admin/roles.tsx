import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ROLES, ROLE_LABELS, ROLE_PERMISSIONS, type Role, type Permission } from "@shared/models/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, ShieldCheck, ShieldAlert, Users, Search, Check, X, UserPlus } from "lucide-react";
import { useState } from "react";

const PERMISSION_LABELS: Record<Permission, string> = {
  view_dashboard: "View Dashboard",
  manage_products: "Manage Products",
  view_orders: "View Orders",
  manage_orders: "Manage Orders",
  view_customers: "View Customers",
  manage_customers: "Manage Customers",
  manage_categories: "Manage Categories",
  manage_coupons: "Manage Coupons",
  manage_delivery: "Manage Delivery",
  manage_roles: "Manage Roles",
};

const ROLE_COLORS: Record<Role, string> = {
  super_admin: "bg-red-500/15 text-red-700 dark:text-red-400",
  manager: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  staff: "bg-green-500/15 text-green-700 dark:text-green-400",
  customer: "bg-muted text-muted-foreground",
};

const ROLE_ICONS: Record<Role, typeof Shield> = {
  super_admin: ShieldAlert,
  manager: ShieldCheck,
  staff: Shield,
  customer: Users,
};

export default function AdminRoles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [selectedNewRole, setSelectedNewRole] = useState<Role>("staff");

  const { data: staffUsers = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/roles"],
  });

  const { data: allCustomers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/customers"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      await apiRequest("PATCH", `/api/admin/roles/${userId}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Role updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update role", variant: "destructive" });
    },
  });

  const filteredStaff = staffUsers.filter((u: any) => {
    const name = `${u.firstName || ""} ${u.lastName || ""}`.trim().toLowerCase();
    const email = (u.email || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const customerOnlyUsers = allCustomers.filter((u: any) => {
    const role = u.role || (u.isAdmin ? "super_admin" : "customer");
    if (role !== "customer") return false;
    const name = `${u.firstName || ""} ${u.lastName || ""}`.trim().toLowerCase();
    const email = (u.email || "").toLowerCase();
    const q = addSearch.toLowerCase();
    return q === "" || name.includes(q) || email.includes(q);
  });

  const handlePromote = (userId: string) => {
    updateRoleMutation.mutate({ userId, role: selectedNewRole });
    setAddDialogOpen(false);
    setAddSearch("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold" data-testid="text-admin-roles-title">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team member roles and access levels</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} data-testid="button-add-team-member">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(ROLES.filter(r => r !== "customer") as Role[]).map((role) => {
          const Icon = ROLE_ICONS[role];
          const count = staffUsers.filter((u: any) => (u.role || "customer") === role).length;
          return (
            <Card key={role} data-testid={`card-role-${role}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center ${ROLE_COLORS[role]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
                    <p className="text-xs text-muted-foreground">{count} {count === 1 ? "member" : "members"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card data-testid="card-team-members">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 space-y-0 pb-4">
          <CardTitle className="text-lg">Team Members</CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-team"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No team members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="hidden md:table-cell">Permissions</TableHead>
                    <TableHead className="w-[120px] sm:w-[180px]">Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((user: any) => {
                    const role = (user.role || "customer") as Role;
                    const Icon = ROLE_ICONS[role];
                    const perms = ROLE_PERMISSIONS[role] || [];
                    const initials = `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}`.toUpperCase() || "?";
                    return (
                      <TableRow key={user.id} data-testid={`row-team-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-[#C9A961]/15 text-[#C9A961]">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" data-testid={`text-team-name-${user.id}`}>
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${ROLE_COLORS[role]} border-0`} data-testid={`badge-role-${user.id}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {ROLE_LABELS[role]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {perms.length === 0 ? (
                              <span className="text-xs text-muted-foreground">No permissions</span>
                            ) : (
                              perms.slice(0, 3).map((p) => (
                                <Badge key={p} variant="outline" className="text-[10px] py-0">
                                  {PERMISSION_LABELS[p]}
                                </Badge>
                              ))
                            )}
                            {perms.length > 3 && (
                              <Badge variant="outline" className="text-[10px] py-0">
                                +{perms.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={role}
                            onValueChange={(val) => updateRoleMutation.mutate({ userId: user.id, role: val as Role })}
                            data-testid={`select-role-${user.id}`}
                          >
                            <SelectTrigger className="h-8 text-xs" data-testid={`trigger-role-${user.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r} value={r} data-testid={`option-role-${r}`}>
                                  {ROLE_LABELS[r]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card data-testid="card-permissions-matrix">
        <CardHeader>
          <CardTitle className="text-lg">Permissions Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] sm:min-w-[160px]">Permission</TableHead>
                  {(ROLES.filter(r => r !== "customer") as Role[]).map((role) => (
                    <TableHead key={role} className="text-center min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm">{ROLE_LABELS[role]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Object.keys(PERMISSION_LABELS) as Permission[]).map((perm) => (
                  <TableRow key={perm}>
                    <TableCell className="text-sm">{PERMISSION_LABELS[perm]}</TableCell>
                    {(ROLES.filter(r => r !== "customer") as Role[]).map((role) => {
                      const has = ROLE_PERMISSIONS[role].includes(perm);
                      return (
                        <TableCell key={role} className="text-center">
                          {has ? (
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Promote an existing customer to a team role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Role to Assign</label>
              <Select value={selectedNewRole} onValueChange={(v) => setSelectedNewRole(v as Role)}>
                <SelectTrigger data-testid="select-new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Search Customers</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-customer-promote"
                />
              </div>
            </div>
            <div className="max-h-[240px] overflow-y-auto space-y-1">
              {customerOnlyUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No customers found</p>
              ) : (
                customerOnlyUsers.slice(0, 20).map((user: any) => {
                  const initials = `${(user.firstName || "")[0] || ""}${(user.lastName || "")[0] || ""}`.toUpperCase() || "?";
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                      onClick={() => handlePromote(user.id)}
                      data-testid={`button-promote-${user.id}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-[#C9A961]/15 text-[#C9A961]">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0">
                        <UserPlus className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} data-testid="button-cancel-promote">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
