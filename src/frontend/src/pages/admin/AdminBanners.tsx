import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  type BackendBanner,
  useCreateBannerAdmin,
  useDeleteBannerAdmin,
  useGetAllBannersAdmin,
  useUpdateBannerAdmin,
} from "@/hooks/useAdminQueries";
import {
  AlertTriangle,
  Edit,
  Loader2,
  Megaphone,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BannerFormState {
  title: string;
  description: string;
  badgeText: string;
  isActive: boolean;
}

const defaultForm: BannerFormState = {
  title: "",
  description: "",
  badgeText: "",
  isActive: true,
};

function formatDate(ns: bigint) {
  const ms = Number(ns / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminBanners() {
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState<BackendBanner | null>(null);
  const [form, setForm] = useState<BannerFormState>(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<BackendBanner | null>(null);

  const { data: banners = [], isLoading } = useGetAllBannersAdmin();
  const createBanner = useCreateBannerAdmin();
  const updateBanner = useUpdateBannerAdmin();
  const deleteBanner = useDeleteBannerAdmin();

  function openAddModal() {
    setEditBanner(null);
    setForm(defaultForm);
    setShowModal(true);
  }

  function openEditModal(banner: BackendBanner) {
    setEditBanner(banner);
    setForm({
      title: banner.title,
      description: banner.description,
      badgeText: banner.badgeText,
      isActive: banner.isActive,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditBanner(null);
    setForm(defaultForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    try {
      if (editBanner) {
        await updateBanner.mutateAsync({
          id: editBanner.id,
          title: form.title.trim(),
          description: form.description.trim(),
          badgeText: form.badgeText.trim(),
          isActive: form.isActive,
        });
        toast.success("Banner updated!");
      } else {
        await createBanner.mutateAsync({
          title: form.title.trim(),
          description: form.description.trim(),
          badgeText: form.badgeText.trim(),
        });
        toast.success("Banner created!");
      }
      closeModal();
    } catch {
      toast.error(
        editBanner ? "Failed to update banner." : "Failed to create banner.",
      );
    }
  }

  async function handleToggleActive(banner: BackendBanner) {
    try {
      await updateBanner.mutateAsync({
        id: banner.id,
        title: banner.title,
        description: banner.description,
        badgeText: banner.badgeText,
        isActive: !banner.isActive,
      });
      toast.success(`Banner ${banner.isActive ? "deactivated" : "activated"}.`);
    } catch {
      toast.error("Failed to update banner status.");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteBanner.mutateAsync(deleteTarget.id);
      toast.success("Banner deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete banner.");
    }
  }

  const isSaving = createBanner.isPending || updateBanner.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Promo Banners
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage promotional banners shown at the top of the customer store
          </p>
        </div>
        <Button
          data-ocid="banners.add.primary_button"
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 h-9 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </Button>
      </div>

      {/* Banner list */}
      {isLoading ? (
        <div data-ocid="banners.loading_state" className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div
          data-ocid="banners.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl bg-card"
        >
          <Megaphone className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No banners yet
          </p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Create a banner to show promotions on the customer storefront
          </p>
          <Button
            onClick={openAddModal}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Banner
          </Button>
        </div>
      ) : (
        <div data-ocid="banners.list" className="space-y-3">
          {banners.map((banner, i) => (
            <div
              key={banner.id.toString()}
              data-ocid={`banners.item.${i + 1}`}
              className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-sm text-foreground">
                    {banner.title}
                  </h3>
                  {banner.badgeText && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                      {banner.badgeText}
                    </Badge>
                  )}
                  <Badge
                    className={
                      banner.isActive
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200 text-xs"
                        : "bg-muted text-muted-foreground border-border text-xs"
                    }
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {banner.description}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Created {formatDate(banner.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch
                  data-ocid={`banners.active.switch.${i + 1}`}
                  checked={banner.isActive}
                  onCheckedChange={() => handleToggleActive(banner)}
                  aria-label="Toggle active"
                />
                <Button
                  data-ocid={`banners.edit_button.${i + 1}`}
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(banner)}
                  className="h-7 px-2.5 rounded-lg text-xs gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  data-ocid={`banners.delete_button.${i + 1}`}
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget(banner)}
                  className="h-7 px-2.5 rounded-lg text-xs gap-1 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          data-ocid="banners.modal"
          className="max-w-md rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editBanner ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editBanner
                ? "Update the banner details below."
                : "Create a promotional banner for the customer storefront."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="banner-title" className="text-sm font-semibold">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="banner-title"
                data-ocid="banners.title.input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                required
                placeholder="e.g. Free delivery on orders above ₹500"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="banner-desc" className="text-sm font-semibold">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="banner-desc"
                data-ocid="banners.description.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                required
                placeholder="Additional details about the promotion…"
                rows={2}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="banner-badge" className="text-sm font-semibold">
                Badge Text{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="banner-badge"
                data-ocid="banners.badge.input"
                value={form.badgeText}
                onChange={(e) =>
                  setForm((p) => ({ ...p, badgeText: e.target.value }))
                }
                placeholder="e.g. LIMITED TIME"
                className="rounded-xl"
              />
            </div>

            {editBanner && (
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <Label
                  htmlFor="banner-active"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Active (visible to customers)
                </Label>
                <Switch
                  id="banner-active"
                  data-ocid="banners.active_edit.switch"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((p) => ({ ...p, isActive: checked }))
                  }
                />
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                data-ocid="banners.modal.cancel_button"
                type="button"
                variant="outline"
                onClick={closeModal}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                data-ocid="banners.modal.submit_button"
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : editBanner ? (
                  "Save Changes"
                ) : (
                  "Create Banner"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent
          data-ocid="banners.delete.dialog"
          className="max-w-sm rounded-2xl"
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="font-display text-lg">
                Delete Banner?
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              <strong>"{deleteTarget?.title}"</strong> will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="banners.delete.cancel_button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              data-ocid="banners.delete.confirm_button"
              onClick={handleDelete}
              disabled={deleteBanner.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl gap-2"
            >
              {deleteBanner.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
