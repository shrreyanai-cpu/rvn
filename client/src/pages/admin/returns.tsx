import { useState } from "react";
import { RotateCcw, CheckCircle, XCircle, Clock, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ReturnRequestEnriched {
  id: number;
  orderId: number;
  userId: string;
  reason: string;
  damageVideoUrl?: string | null;
  status: string;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  order: { id: number; totalAmount: string; items: any[]; status: string } | null;
  customerName: string;
  customerEmail: string;
}

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  approved: { label: "Approved", icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function AdminReturns() {
  const { toast } = useToast();
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequestEnriched | null>(null);
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: returns, isLoading } = useQuery<ReturnRequestEnriched[]>({
    queryKey: ["/api/admin/returns"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/returns/${id}`, { status, adminNotes: adminNotes || undefined });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/returns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: `Return request ${actionType}`, description: "The customer has been notified via email." });
      setSelectedReturn(null);
      setActionType(null);
      setAdminNotes("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update return request", variant: "destructive" });
    },
  });

  const openAction = (ret: ReturnRequestEnriched, type: "approved" | "rejected") => {
    setSelectedReturn(ret);
    setActionType(type);
    setAdminNotes("");
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-56 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const pending = (returns || []).filter(r => r.status === "pending");
  const resolved = (returns || []).filter(r => r.status !== "pending");

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <RotateCcw className="h-6 w-6 text-[#C9A961]" />
        <h1 className="font-serif text-2xl font-bold" data-testid="text-admin-returns-title">
          Return Requests
        </h1>
        {pending.length > 0 && (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 no-default-hover-elevate no-default-active-elevate">
            {pending.length} pending
          </Badge>
        )}
      </div>

      {(!returns || returns.length === 0) ? (
        <div className="text-center py-16">
          <RotateCcw className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No return requests yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Pending Review</h2>
              <div className="space-y-3">
                {pending.map(ret => (
                  <ReturnCard key={ret.id} ret={ret} onAction={openAction} />
                ))}
              </div>
            </div>
          )}

          {resolved.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Resolved</h2>
              <div className="space-y-3">
                {resolved.map(ret => (
                  <ReturnCard key={ret.id} ret={ret} onAction={openAction} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selectedReturn && !!actionType} onOpenChange={() => { setSelectedReturn(null); setActionType(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approved" ? "Approve" : "Reject"} Return Request
            </DialogTitle>
            <DialogDescription>
              Order #{selectedReturn?.orderId} by {selectedReturn?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {selectedReturn?.damageVideoUrl && (
              <div>
                <p className="text-sm font-medium mb-1">Damage / Unboxing Video</p>
                <video
                  src={selectedReturn.damageVideoUrl}
                  controls
                  className="w-full max-h-64 rounded-md border bg-muted"
                  data-testid="video-admin-damage-preview"
                />
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-1">Damage Description</p>
              <p className="text-sm text-muted-foreground bg-muted rounded-md p-3">{selectedReturn?.reason}</p>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="admin-notes">Admin Notes (optional)</label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={actionType === "approved" ? "e.g., Please ship the items back within 3 days..." : "e.g., Return window has expired..."}
                className="mt-1"
                data-testid="input-admin-notes"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setSelectedReturn(null); setActionType(null); }} data-testid="button-cancel-action">
              Cancel
            </Button>
            <Button
              variant={actionType === "approved" ? "default" : "destructive"}
              disabled={updateMutation.isPending}
              onClick={() => {
                if (selectedReturn && actionType) {
                  updateMutation.mutate({ id: selectedReturn.id, status: actionType, adminNotes });
                }
              }}
              data-testid={`button-confirm-${actionType}`}
            >
              {updateMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {actionType === "approved" ? "Approve Return" : "Reject Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReturnCard({ ret, onAction }: { ret: ReturnRequestEnriched; onAction: (r: ReturnRequestEnriched, type: "approved" | "rejected") => void }) {
  const status = statusConfig[ret.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const items = ret.order?.items || [];

  return (
    <Card className="p-4" data-testid={`card-return-${ret.id}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <span className="font-semibold text-sm">Order #{ret.orderId}</span>
            <Badge className={`text-[10px] font-medium border-0 no-default-hover-elevate no-default-active-elevate ${status.className}`}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {ret.customerName} ({ret.customerEmail}) &bull; {new Date(ret.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          {ret.damageVideoUrl && (
            <div className="mb-2">
              <video
                src={ret.damageVideoUrl}
                className="w-32 h-24 object-cover rounded-md border"
                data-testid={`video-damage-${ret.id}`}
                muted
                preload="metadata"
              />
            </div>
          )}
          <div className="bg-muted rounded-md p-3 mb-2">
            <p className="text-sm text-muted-foreground">{ret.reason}</p>
          </div>
          {ret.adminNotes && (
            <div className="bg-muted/50 rounded-md p-3 border-l-2 border-[#C9A961]">
              <p className="text-xs font-medium mb-0.5">Admin Notes</p>
              <p className="text-sm text-muted-foreground">{ret.adminNotes}</p>
            </div>
          )}
          {items.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {items.length} item(s) &bull; Total: Rs. {Number(ret.order?.totalAmount || 0).toLocaleString("en-IN")}
            </div>
          )}
        </div>
        {ret.status === "pending" && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => onAction(ret, "approved")}
              data-testid={`button-approve-return-${ret.id}`}
            >
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(ret, "rejected")}
              data-testid={`button-reject-return-${ret.id}`}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
