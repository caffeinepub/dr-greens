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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  type BackendProduct,
  useAddProduct,
  useDeactivateProduct,
  useGetProducts,
  useUpdateProduct,
} from "@/hooks/useQueries";
import {
  AlertTriangle,
  Boxes,
  Edit,
  Loader2,
  Plus,
  PowerOff,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PRODUCT_IMAGES: Record<number, string> = {
  1: "/assets/generated/sunflower-shoots.dim_600x400.jpg",
  2: "/assets/generated/pea-shoots.dim_600x400.jpg",
  3: "/assets/generated/radish-microgreens.dim_600x400.jpg",
  4: "/assets/generated/broccoli-microgreens.dim_600x400.jpg",
  5: "/assets/generated/wheatgrass.dim_600x400.jpg",
  6: "/assets/generated/mixed-microgreens.dim_600x400.jpg",
};
const FALLBACK_IMAGE = "/assets/generated/mixed-microgreens.dim_600x400.jpg";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  unit: string;
  stock: string;
  isActive: boolean;
}

const defaultForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  unit: "",
  stock: "",
  isActive: true,
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AdminProducts() {
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<BackendProduct | null>(null);
  const [form, setForm] = useState<ProductFormState>(defaultForm);
  const [deactivateTarget, setDeactivateTarget] =
    useState<BackendProduct | null>(null);

  const { data: products = [], isLoading } = useGetProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deactivateProduct = useDeactivateProduct();

  function openAddModal() {
    setEditProduct(null);
    setForm(defaultForm);
    setShowModal(true);
  }

  function openEditModal(product: BackendProduct) {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      unit: product.unit,
      stock: String(product.stock),
      isActive: product.isActive,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditProduct(null);
    setForm(defaultForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number.parseFloat(form.price);
    const stock = Number.parseInt(form.stock, 10);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }
    try {
      if (editProduct) {
        await updateProduct.mutateAsync({
          id: editProduct.id,
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          unit: form.unit.trim(),
          stock: BigInt(stock),
          isActive: form.isActive,
        });
        toast.success(`"${form.name}" updated successfully!`);
      } else {
        await addProduct.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          unit: form.unit.trim(),
          stock: BigInt(stock),
        });
        toast.success(`"${form.name}" added to the product list!`);
      }
      closeModal();
    } catch {
      toast.error(
        editProduct ? "Failed to update product." : "Failed to add product.",
      );
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    try {
      await deactivateProduct.mutateAsync(deactivateTarget.id);
      toast.success(`"${deactivateTarget.name}" has been deactivated.`);
      setDeactivateTarget(null);
    } catch {
      toast.error("Failed to deactivate product.");
    }
  }

  const isSaving = addProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your microgreen product catalogue
          </p>
        </div>
        <Button
          data-ocid="products.add.primary_button"
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 h-9 text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {products.length} active product{products.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      {isLoading ? (
        <div
          data-ocid="products.loading_state"
          className="space-y-2 rounded-xl border border-border overflow-hidden"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
            <Skeleton key={i} className="h-14 w-full rounded-none" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          data-ocid="products.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl bg-card"
        >
          <Boxes className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-semibold text-foreground">
            No products yet
          </p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Add your first microgreen product to get started
          </p>
          <Button
            onClick={openAddModal}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </Button>
        </div>
      ) : (
        <div
          data-ocid="products.table"
          className="rounded-xl border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16">
                    Photo
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell max-w-[200px]">
                    Description
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Price
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Unit
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">
                    Stock
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, i) => (
                  <TableRow
                    key={String(product.id)}
                    data-ocid={`products.row.item.${i + 1}`}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="py-2">
                      <img
                        src={
                          PRODUCT_IMAGES[Number(product.id)] ?? FALLBACK_IMAGE
                        }
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-border"
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-sm text-foreground">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px]">
                      <span className="line-clamp-2">
                        {product.description}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-right text-foreground">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {product.unit}
                    </TableCell>
                    <TableCell className="text-sm text-center font-medium">
                      {String(product.stock)}
                    </TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold">
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          data-ocid={`products.edit_button.${i + 1}`}
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(product)}
                          className="h-7 px-2.5 rounded-lg text-xs gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        {product.isActive && (
                          <Button
                            data-ocid={`products.delete_button.${i + 1}`}
                            variant="outline"
                            size="sm"
                            onClick={() => setDeactivateTarget(product)}
                            className="h-7 px-2.5 rounded-lg text-xs gap-1 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                          >
                            <PowerOff className="w-3 h-3" />
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent
          data-ocid="products.modal"
          className="max-w-md rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editProduct
                ? "Update the product details below."
                : "Fill in the details to add a new microgreen product."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="product-name" className="text-sm font-semibold">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                data-ocid="products.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
                placeholder="e.g. Sunflower Microgreens"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-desc" className="text-sm font-semibold">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="product-desc"
                data-ocid="products.description.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                required
                placeholder="Describe the microgreen variety…"
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="product-price"
                  className="text-sm font-semibold"
                >
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="product-price"
                  data-ocid="products.price.input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: e.target.value }))
                  }
                  required
                  placeholder="150.00"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="product-unit" className="text-sm font-semibold">
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="product-unit"
                  data-ocid="products.unit.input"
                  value={form.unit}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, unit: e.target.value }))
                  }
                  required
                  placeholder="per tray"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-stock" className="text-sm font-semibold">
                Stock Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-stock"
                data-ocid="products.stock.input"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) =>
                  setForm((p) => ({ ...p, stock: e.target.value }))
                }
                required
                placeholder="50"
                className="rounded-xl"
              />
            </div>

            {editProduct && (
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <Label
                  htmlFor="product-active"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Active (visible to customers)
                </Label>
                <Switch
                  id="product-active"
                  data-ocid="products.active.switch"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((p) => ({ ...p, isActive: checked }))
                  }
                />
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                data-ocid="products.modal.cancel_button"
                type="button"
                variant="outline"
                onClick={closeModal}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                data-ocid="products.modal.submit_button"
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : editProduct ? (
                  "Save Changes"
                ) : (
                  "Add Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm Dialog */}
      <Dialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <DialogContent
          data-ocid="products.deactivate.dialog"
          className="max-w-sm rounded-2xl"
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <DialogTitle className="font-display text-lg">
                Deactivate Product?
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              <strong>"{deactivateTarget?.name}"</strong> will be hidden from
              customers and no longer available to order.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="products.deactivate.cancel_button"
              variant="outline"
              onClick={() => setDeactivateTarget(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              data-ocid="products.deactivate.confirm_button"
              onClick={handleDeactivate}
              disabled={deactivateProduct.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl gap-2"
            >
              {deactivateProduct.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PowerOff className="w-4 h-4" />
              )}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
